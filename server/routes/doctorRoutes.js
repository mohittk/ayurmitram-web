const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const DoctorSchema = require("../models/doctorSchema");

router.post('/signup', async (req, res) => {
   try {
    const {doctor_name, doctor_email, doctor_password } = req.body;

    if(!doctor_name || !doctor_email || !doctor_password) {
        return res.status(400).json({message: 'Please fill all the required details'});
    }
    console.log(doctor_name, doctor_email, doctor_password)

    const existingUser = await DoctorSchema.findOne({doctor_email});
    if(existingUser){
        console.log(existingUser);
        return res.status(400).json({message: 'Email already exists. Please choose another email'});
    }

    const hashedPassword = await bcrypt.hash(doctor_password, 10);
    const newDoctor = new DoctorSchema({
        doctor_name,
        doctor_email,
        doctor_password: hashedPassword
    });

    await newDoctor.save();

    const token=jwt.sign({patientId: newDoctor._id}, process.env.SECRET_KEY, {expiresIn: '2h'});
    res.json({token});

   } catch (err) {
    console.log(err);
   }
})

router.post('/complete-profile', async (req, res) => {
  try {
      const {
          doctorId,
          doctor_consultant_type,
          doctor_specialization,
          doctor_experience,
          doctor_description,
          doctor_education,
          doctor_clinic_name,
          doctor_clinic_address,
          doctor_contact_number,
          doctor_languages_spoken,
          doctor_availability,
          doctor_preferred_comm,
          doctor_area_of_expertise,
          doctor_website
      } = req.body;

      const doctor = await DoctorSchema.findById(doctorId);
      if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
      }

      doctor.doctor_consultant_type = doctor_consultant_type;
      doctor.doctor_specialization = doctor_specialization;
      doctor.doctor_experience = doctor_experience;
      doctor.doctor_description = doctor_description;
      doctor.doctor_education = doctor_education;
      doctor.doctor_clinic_name = doctor_clinic_name;
      doctor.doctor_clinic_address = doctor_clinic_address;
      doctor.doctor_contact_number = doctor_contact_number;
      doctor.doctor_languages_spoken = doctor_languages_spoken;
      doctor.doctor_availability = doctor_availability;
      doctor.doctor_preferred_comm = doctor_preferred_comm;
      doctor.doctor_area_of_expertise = doctor_area_of_expertise;
      doctor.doctor_website = doctor_website;

      await doctor.save();

      res.json({ message: 'Profile completed successfully' });

  } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
    try {
        const {doctor_email, doctor_password} = req.body;

        if(!doctor_email || !doctor_password) {
            return res.status(400).json({message: 'Please fill all the required details'});
        }

        const doctor = await DoctorSchema.findOne({doctor_email});
        if(!doctor) {
            return res.status(400).json({message: 'Invalid Email or Password'});
        }

        const isPasswordValid = await bcrypt.compare(doctor_password, doctor.doctor_password);
        if(!isPasswordValid) {
            return res.status(400).json({message: 'Invalid Email or Password'});
        }

        const token=jwt.sign({doctorId: doctor._id}, process.env.SECRET_KEY, {expiresIn: '2h'});
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
      const userId = decoded.doctorId;
  
      const doctor = await DoctorSchema.findById(userId);
  
      if (!doctor) {
        return res.status(401).json({ error: 'Doctor not found' });
      }
  

      return res.json({ message: `Authenticated user: ${userId}`, tag: true });
    } catch (error) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
  });

router.get('/alldoctors', async (req, res) => {
  try {
    const doctors = await DoctorSchema.find();
    res.json(doctors);
  } catch (err) {
    console.log(err);
  }
})

module.exports = router;
