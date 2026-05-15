from pydantic import BaseModel
from typing import Optional, List

class Visit(BaseModel):
    visitDate: str
    cobbAngle: float
    spineRegion: str
    progression: Optional[float] = None
    physician: str
    notes: Optional[str] = None
    painLevel: Optional[int] = None

class Patient(BaseModel):
    firstName: str
    lastName: str
    dateOfBirth: str
    gender: str
    diagnosisType: str
    curveLocation: str
    rissersSign: int
    initialCobbAngle: float
    treatmentPlan: str
    braceType: Optional[str] = None
    braceHoursPerDay: Optional[int] = None
    physicalTherapy: Optional[bool] = False
    visits: List[Visit] = []
    photo: Optional[str] = None