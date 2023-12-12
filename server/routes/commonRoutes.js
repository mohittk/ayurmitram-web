const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const PatientSchema = require("../models/patientSchema");
const DoctorSchema = require("../models/doctorSchema");


router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({message: 'Please fill all the required details'});
        }

        const patient = await PatientSchema.findOne({patient_email: email});
        const doctor = await DoctorSchema.findOne({doctor_email: email});

        if(!patient && !doctor) {
            return res.status(400).json({message: 'Invalid Email or Password'});
        }

        const isPasswordValid = patient ? await bcrypt.compare(password, patient.patient_password) : await bcrypt.compare(password, doctor.doctor_password)
        if(!isPasswordValid) {
            return res.status(400).json({message: 'Invalid Email or Password'});
        }

        const token=jwt.sign(patient ? {patientId: patient._id} : {doctorId: doctor._id}, process.env.SECRET_KEY, {expiresIn: '2h'});
        res.json({token});
    } catch(err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
})

router.post('/auth', async (req, res) => {
    const token = req.body.token;
  
    try {
        if (!token) {
            return res.status(401).json({ error: 'Token not provided' });
        }
    //   console.log(token);
  
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decoded);
    const doctorId = decoded.doctorId;
    const patientId = decoded.patientId;

    const doctor = doctorId ? await DoctorSchema.findById(doctorId) : null;
    const patient = patientId ? await PatientSchema.findById(patientId) : null;

    if (!doctor && !patient) {
        return res.status(401).json({ error: 'User not found' });
    }

    return res.json({ message: `Authenticated user: ${doctorId ? doctorId : patientId}`, tag: true });
    } catch (error) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
});


module.exports = router;