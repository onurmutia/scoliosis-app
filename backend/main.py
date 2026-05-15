import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Patient, Visit
from database import patients_collection
from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
import base64

load_dotenv()
app = FastAPI()

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def to_object_id(id: str) -> ObjectId:
    try:
        return ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")

@app.get("/api/patients")
async def get_patients():
    patients = []
    async for p in patients_collection.find():
        p["_id"] = str(p["_id"])
        patients.append(p)
    return patients

@app.get("/api/patients/{id}")
async def get_patient(id: str):
    p = await patients_collection.find_one({"_id": to_object_id(id)})
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    p["_id"] = str(p["_id"])
    return p

@app.post("/api/patients")
async def add_patient(patient: Patient):
    result = await patients_collection.insert_one(patient.dict())
    return {"id": str(result.inserted_id)}

@app.post("/api/patients/{id}/visits")
async def add_visit(id: str, visit: Visit):
    result = await patients_collection.update_one(
        {"_id": to_object_id(id)},
        {"$push": {"visits": visit.dict()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Visit added"}

@app.put("/api/patients/{id}")
async def update_patient(id: str, patient: Patient):
    data = patient.dict(exclude={"visits", "photo"})
    result = await patients_collection.update_one(
        {"_id": to_object_id(id)},
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient updated"}

@app.delete("/api/patients/{id}")
async def delete_patient(id: str):
    result = await patients_collection.delete_one({"_id": to_object_id(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient deleted"}

@app.post("/api/patients/{id}/photo")
async def upload_photo(id: str, file: UploadFile = File(...)):
    contents = await file.read()
    encoded = base64.b64encode(contents).decode("utf-8")
    mime = file.content_type
    photo_data = f"data:{mime};base64,{encoded}"
    result = await patients_collection.update_one(
        {"_id": to_object_id(id)},
        {"$set": {"photo": photo_data}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Photo uploaded"}
