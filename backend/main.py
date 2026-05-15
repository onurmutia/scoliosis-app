from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from models import Patient, Visit
from database import patients_collection
from bson import ObjectId
from dotenv import load_dotenv
import base64

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/patients")
async def get_patients():
    patients = []
    async for p in patients_collection.find():
        p["_id"] = str(p["_id"])
        patients.append(p)
    return patients

@app.get("/api/patients/{id}")
async def get_patient(id: str):
    p = await patients_collection.find_one({"_id": ObjectId(id)})
    p["_id"] = str(p["_id"])
    return p

@app.post("/api/patients")
async def add_patient(patient: Patient):
    result = await patients_collection.insert_one(patient.dict())
    return {"id": str(result.inserted_id)}

@app.post("/api/patients/{id}/visits")
async def add_visit(id: str, visit: Visit):
    await patients_collection.update_one(
        {"_id": ObjectId(id)},
        {"$push": {"visits": visit.dict()}}
    )
    return {"message": "Visit added"}

@app.put("/api/patients/{id}")
async def update_patient(id: str, patient: Patient):
    data = patient.dict()
    await patients_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )
    return {"message": "Patient updated"}

@app.delete("/api/patients/{id}")
async def delete_patient(id: str):
    await patients_collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Patient deleted"}

@app.post("/api/patients/{id}/photo")
async def upload_photo(id: str, file: UploadFile = File(...)):
    contents = await file.read()
    encoded = base64.b64encode(contents).decode("utf-8")
    mime = file.content_type
    photo_data = f"data:{mime};base64,{encoded}"
    await patients_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"photo": photo_data}}
    )
    return {"message": "Photo uploaded"}