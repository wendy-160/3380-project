# MedicalClinicDB

original repo: https://github.com/wendy-160/MedicalClinicDB

## Project Description

**MiniWorld Description**: The database is designed to support a healthcare provider company with multiple offices across different states. The company employs general practice doctors and specialists who provide healthcare services to patients. The database will manage information on patients, doctors, appointments, medical records, medical offices, prescriptions, referral approvals, medical tests, and billing. Our program will ensure efficient coordination among various locations.

Doctors specialize in different medical fields and can work in one or more office locations. A patient is assigned to a primary physician who will provide general care. If specialized treatment is needed, the primary physician will refer the patient to a specialist within their network.

Patients can schedule or cancel appointments with their primary care physician/specialist, get prescriptions, go through medical tests, and have a medical record that gets updated after every appointment. Appointments are scheduled by a patient either via phone or web portal. Each appointment belongs to a single patient and a single doctor, taking place at a specific medical clinic. The system will ensure the patient is sent an email reminder for future appointments. Patients will have the ability to cancel or reschedule their appointments depending on their needs.

At an appointment, the doctor can view a patient’s information, update medical records, create prescriptions, and request medical tests. A patient’s medical record can be updated with diagnoses, prescribed treatments, or referrals for more tests as needed. The system also tracks medical records, prescriptions, and billing to ensure financial processing.

## Hosting Locally

**Clone the Repo**

```bash
git clone https://github.com/wendy-160/MedicalClinicDB.git
cd 3380-project
```

**Starting backend**

```bash
# make sure you are in the backend
npm init -y #install dependencies
node server.js #start server
```

**Starting the frontend**

```
# make sure you are in the fronent
npm install
npm run dev #start client
```

The app should now be running

**users**

- Admin:
  - email: admin@example.com
  - password: Admin123
- Doctor:
  - (Primary Care Physician)
    - email: doctor@example.com
    - password: Doctor123
  - (Specialist)
    - email: yang.heart@example.com
    - password: Yang123
- Patient:
  - email: john.doe@example.com
  - password: John123

## Project Requirements

### 5 Must Haves

- **User authentication for different user roles**.
  - Doctors (Some Access):
    - Home | Dashboard | Prescriptions | MedicalTests | MedicalRecord | Schedule
    - Create referrals for specialists
    - Edit medical records & create new entries
    - Create prescriptions
    - Order/update medical tests
    - Update availability
    - Mark appointments as completed
    - (Specialists) Approve and deny referrals 
  - Patients (Limited Access):
    - Home | Dashboard | Billing
    - Dashboard – See upcoming appointments, prescriptions, test results
    - Schedule/cancel appointments
    - View medical history (no edits allowed)
    - Update profile and contact details
    - View and pay bills and payment history
  - Admins:
    - Home | Dashboard | Reports | Billing | Clinic Management | Doctor-Clinic
    - View appointment status and information
    - Generate reports
    - Add doctor
    - Edit the user's information
    - Reassign a patient to a different primary physician
    - Create and update a patient's billing
    - Add, edit, and remove clinic locations
    - Add, edit, and remove where doctors work including days and hours
- **Data entry forms**.
  - Add new data:
    - Patients can register for the first time
    - Patients can create appointments
    - Doctors can add medical records and prescriptions
    - Admins can add new clinics and doctors
    - Doctors can request medical tests for a patient
    - Admins can create billing
  - Modify existing data:
    - Patients can update their profile and reschedule their appointments
    - Doctors can update patient medical history
    - Admins can modify clinic details
    - Doctors can update or cancel test requests
  - ‘delete’ data:
    - Admins can deactivate user accounts
    - Admins can delete clinics
    - Specialists can reject referals 
- **Triggers**.
  - Limit the number of Active Referrals per patient to no more than 3
  - A referral cannot be used to make an appointment with a Specialist if it is more than 90 days old 
  - A doctor cannot be booked for more than 10 appointments per day

- **Data queries**.
  - Doctors retrieving information based on the ID
  - Doctors retrieving appointment information
  - Doctors retrieving medical test info
  - Doctors retrieving medical records
  - Admins viewing appointment info and status
  - Admins viewing all users
  - Admins view billing information
  - Admins retrieving doctor's work offices and schedules
- **Data reports**.
  - Clinic Profitability Report
    - show revenue for each clinic
  - Patient Visit Frequency Report
    - identify patients who visit frequently and those who stopped
  - Doctor Efficiency Report
    - Evaluate doctor productivity

## Technologies

- **React**
- **Node.js**
- **MySQL**
