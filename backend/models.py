from pydantic import BaseModel, validator
from typing import Optional, List

class Visit(BaseModel):
    visitDate: str
    cobbAngle: float
    spineRegion: str
    progression: Optional[float] = None
    physician: str
    notes: Optional[str] = None
    painLevel: Optional[int] = None

    @validator("cobbAngle")
    def cobb_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Cobb angle must be greater than 0")
        return v

    @validator("painLevel")
    def pain_level_range(cls, v):
        if v is not None and not (0 <= v <= 10):
            raise ValueError("Pain level must be between 0 and 10")
        return v

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

    @validator("rissersSign")
    def risser_range(cls, v):
        if not (0 <= v <= 5):
            raise ValueError("Risser sign must be between 0 and 5")
        return v

    @validator("initialCobbAngle")
    def initial_cobb_positive(cls, v):
        if v <= 0:
            raise ValueError("Initial Cobb angle must be greater than 0")
        return v
