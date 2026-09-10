import { FormSchema } from '../models/FormSchema.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('[Seed] Seeding database schemas and default users...');

  // Seed Admin & Demo User
  const existingUser = await User.findOne({ email: 'user@forma.ai' });
  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    await User.create([
      {
        email: 'user@forma.ai',
        passwordHash,
        name: 'Demo Policyholder',
        role: 'user',
      },
      {
        email: 'admin@forma.ai',
        passwordHash,
        name: 'Forma Admin',
        role: 'admin',
      },
    ]);
    console.log('[Seed] Demo users created: user@forma.ai / admin@forma.ai (Password: Password123!)');
  }

  // Seed Auto Claim Form Schema with 3-Level Deep Branching
  const autoClaimSchema = {
    formType: 'auto_claim',
    title: 'Automobile Incident Insurance Claim',
    description: 'Comprehensive auto insurance claim intake form with AI pre-fill and dynamic branching.',
    version: 1,
    isPublished: true,
    sections: [
      {
        id: 'incident_overview',
        title: '1. Incident Overview',
        description: 'General information regarding the accident or claim event.',
        fields: [
          {
            id: 'incident.type',
            label: 'Type of Incident',
            type: 'select',
            options: [
              { label: 'Animal Collision', value: 'animal_collision' },
              { label: 'Rear-End Collision', value: 'rear_end' },
              { label: 'Weather / Hail Damage', value: 'weather_damage' },
              { label: 'Vehicle Theft', value: 'theft' },
            ],
            validation: { required: true },
            aiExtraction: { entityKey: 'incident.type', description: 'Type of incident (animal_collision, rear_end, weather_damage, theft)' },
          },
          {
            id: 'incident.date',
            label: 'Incident Date',
            type: 'date',
            validation: { required: true },
            aiExtraction: { entityKey: 'incident.date', description: 'Date when the incident occurred' },
          },
          {
            id: 'incident.location',
            label: 'Incident Location / Highway',
            type: 'text',
            placeholder: 'e.g. I-95 North, Mile Marker 42',
            validation: { required: true },
            aiExtraction: { entityKey: 'incident.location', description: 'Highway, street or location where incident happened' },
          },
        ],
      },
      {
        id: 'vehicle_details',
        title: '2. Vehicle Information',
        description: 'Details about the primary vehicle involved.',
        fields: [
          {
            id: 'vehicle.make',
            label: 'Vehicle Make',
            type: 'select',
            options: [
              { label: 'Honda', value: 'Honda' },
              { label: 'Toyota', value: 'Toyota' },
              { label: 'Ford', value: 'Ford' },
              { label: 'Chevrolet', value: 'Chevrolet' },
              { label: 'Tesla', value: 'Tesla' },
            ],
            validation: { required: true },
            aiExtraction: { entityKey: 'vehicle.make', description: 'Car make or manufacturer' },
          },
          {
            id: 'vehicle.model',
            label: 'Vehicle Model',
            type: 'text',
            placeholder: 'e.g. Civic, Accord, Camry',
            validation: { required: false },
            aiExtraction: { entityKey: 'vehicle.model', description: 'Car model name' },
          },
        ],
      },

      // Branching Level 2: Animal Collision specific questions
      {
        id: 'animal_collision_details',
        title: '3. Animal Collision Details (Conditional Branch)',
        description: 'Specific details required for animal impact claims.',
        showIf: { field: 'incident.type', operator: 'equals', value: 'animal_collision' },
        fields: [
          {
            id: 'animal.type',
            label: 'Type of Animal Encountered',
            type: 'select',
            options: [
              { label: 'Deer / Large Game', value: 'deer' },
              { label: 'Moose / Elk', value: 'moose' },
              { label: 'Small Animal', value: 'small_animal' },
            ],
            validation: { required: true },
            showIf: { field: 'incident.type', operator: 'equals', value: 'animal_collision' },
            aiExtraction: { entityKey: 'animal.type', description: 'Type of animal involved (deer, moose, small_animal)' },
          },
          {
            id: 'damage.location',
            label: 'Primary Damage Location',
            type: 'select',
            options: [
              { label: 'Windshield', value: 'windshield' },
              { label: 'Front Bumper', value: 'bumper' },
              { label: 'Side Fender / Door', value: 'fender' },
              { label: 'Hood & Grille', value: 'hood' },
            ],
            validation: { required: true },
            showIf: { field: 'incident.type', operator: 'equals', value: 'animal_collision' },
            aiExtraction: { entityKey: 'damage.location', description: 'Main damaged area of the vehicle' },
          },
        ],
      },

      // Branching Level 3: Deep Nested Branching (Triggered when animal.type == deer AND vehicle.make == Honda)
      {
        id: 'honda_deer_safety_assessment',
        title: '4. Deep Inspection & Towing (3-Level Deep Branch)',
        description: 'Level 3 conditional branch activated for Honda deer impact claims.',
        showIf: {
          allTrue: [
            { field: 'incident.type', operator: 'equals', value: 'animal_collision' },
            { field: 'animal.type', operator: 'equals', value: 'deer' },
            { field: 'vehicle.make', operator: 'equals', value: 'Honda' },
          ],
        },
        fields: [
          {
            id: 'damage.severity',
            label: 'Damage Severity Assessment',
            type: 'radio',
            options: [
              { label: 'Severe / Shattered', value: 'severe' },
              { label: 'Moderate Crack', value: 'moderate' },
              { label: 'Minor Scratch', value: 'minor' },
            ],
            validation: { required: true },
            aiExtraction: { entityKey: 'damage.severity', description: 'Severity of damage (severe, moderate, minor)' },
          },
          {
            id: 'safety.airbags_deployed',
            label: 'Did airbags deploy during impact?',
            type: 'radio',
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ],
            validation: { required: true },
          },
          {
            id: 'towing.required',
            label: 'Is immediate roadside towing required?',
            type: 'radio',
            options: [
              { label: 'Yes - Vehicle non-drivable', value: 'yes' },
              { label: 'No - Drivable', value: 'no' },
            ],
            validation: { required: true },
          },
          {
            id: 'towing.location',
            label: 'Tow Destination Repair Shop',
            type: 'text',
            placeholder: 'Preferred auto repair shop name or address',
            showIf: { field: 'towing.required', operator: 'equals', value: 'yes' },
          },
        ],
      },
    ],
  };

  const existingAutoClaim = await FormSchema.findOne({ formType: 'auto_claim', version: 1 });
  if (!existingAutoClaim) {
    await FormSchema.create(autoClaimSchema);
    console.log('[Seed] Auto Claim Form Schema (v1) created successfully');
  }

  // Seed Health Intake Schema
  const healthIntakeSchema = {
    formType: 'health_intake',
    title: 'Healthcare Patient Medical Intake',
    description: 'Medical history and symptoms intake form with automated triage pre-fill.',
    version: 1,
    isPublished: true,
    sections: [
      {
        id: 'patient_symptoms',
        title: 'Primary Symptoms & Chief Complaint',
        fields: [
          {
            id: 'symptom.primary',
            label: 'Chief Symptom / Complaint',
            type: 'select',
            options: [
              { label: 'Chest Pain', value: 'chest_pain' },
              { label: 'Shortness of Breath', value: 'shortness_of_breath' },
              { label: 'Abdominal Pain', value: 'abdominal_pain' },
              { label: 'Fever & Fatigue', value: 'fever' },
            ],
            validation: { required: true },
            aiExtraction: { entityKey: 'symptom.primary', description: 'Primary chief complaint' },
          },
          {
            id: 'symptom.severity',
            label: 'Symptom Severity Rating',
            type: 'select',
            options: [
              { label: 'Severe / Acute', value: 'severe' },
              { label: 'Moderate', value: 'moderate' },
              { label: 'Mild', value: 'mild' },
            ],
            validation: { required: true },
            aiExtraction: { entityKey: 'symptom.severity', description: 'Severity of symptoms' },
          },
        ],
      },
      {
        id: 'cardiac_evaluation',
        title: 'Cardiac Evaluation (Conditional Branch)',
        showIf: { field: 'symptom.primary', operator: 'equals', value: 'chest_pain' },
        fields: [
          {
            id: 'history.cardiac',
            label: 'Prior Cardiac / Heart History?',
            type: 'radio',
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ],
            validation: { required: true },
            aiExtraction: { entityKey: 'history.cardiac', description: 'Prior history of cardiac conditions' },
          },
        ],
      },
    ],
  };

  const existingHealthIntake = await FormSchema.findOne({ formType: 'health_intake', version: 1 });
  if (!existingHealthIntake) {
    await FormSchema.create(healthIntakeSchema);
    console.log('[Seed] Health Intake Form Schema (v1) created successfully');
  }

  console.log('[Seed] Seeding complete.');
}
