


'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Add new Product
 * @param {org.lms.ehr.CreatePrescription} addprescription - new prescription addition
 * @transaction
 */
function addprescription(newprescription) {
  var  NS =  'org.lms.ehr';
  var prescription = getFactory().newResource(NS, 'Prescription', newprescription.recordId);
  prescription.comments = newprescription.comments;
    prescription.description = newprescription.description;
  prescription.time = newprescription.time
  prescription.drug = newprescription.drug;
   prescription.pharma = newprescription.pharma;
  prescription.nurse = newprescription.nurse;
    prescription.doctor = newprescription.doctor;
     prescription.patient = newprescription.patient;
     prescription.meds = newprescription.meds;
     
  if(!prescription.meds.prescription) {
    prescription.meds.prescription = [];
  }
  prescription.meds.prescription.push(prescription);
  return getAssetRegistry(NS + '.Prescription').then(function(registry) {
    return registry.add(prescription);
  }).then(function() {
    return getAssetRegistry(NS + '.MedicalRecords');
  }).then(function(medsRegistry) {
    return medsRegistry.update(newprescription.meds);
  });
}

/**
 * Add new Product
 * @param {org.lms.ehr.take_appointment} addappointment - new appointment addition
 * @transaction
 */
function addappointment(newappointment) {
  var  NS =  'org.lms.ehr';
  var appointment = getFactory().newResource(NS, 'appointment', newappointment.appId);
  appointment.datefield = newappointment.datefield;
    appointment.doctor = newappointment.doctor;
     appointment.patient = newappointment.patient;
     appointment.meds = newappointment.meds;
     
  if(!appointment.meds.app) {
    appointment.meds.app = [];
  }
  appointment.meds.app.push(appointment);
  return getAssetRegistry(NS + '.appointment').then(function(registry) {
    return registry.add(appointment);
  }).then(function() {
    return getAssetRegistry(NS + '.MedicalRecords');
  }).then(function(medsRegistry) {
    return medsRegistry.update(newappointment.meds);
  });
}

/****
* Creates the medical record 
*/
function generateRecordId(email){
  var number = Math.random();
  var id = email+number;
  return id;
}

/**
 * Place an order for a vehicle
 * @param {org.lms.ehr.createorder} placeOrder - the PlaceOrder transaction
 * @transaction
 */
async function placeOrder(orderRequest) { // eslint-disable-line no-unused-vars
    

    const factory = getFactory();
    const namespace = 'org.lms.ehr';

    const order = factory.newResource(namespace, 'Order', orderRequest.orderId);
    order.status = 'waiting';
    order.prescription=orderRequest.prescription;
    order.pharma=orderRequest.pharma;
    order.nurse=orderRequest.nurse;
    // save the order
    const assetRegistry = await getAssetRegistry(order.getFullyQualifiedType());
    await assetRegistry.add(order);

   
}
/**
 * Update the status of an order
 * @param {org.lms.ehr.updateorderstatus} updateOrderStatus - the UpdateOrderStatus transaction
 * @transaction
 */
async function updateOrderStatus(updateOrderRequest) {
  const factory = getFactory();
    const namespace = 'org.lms.ehr';
    const order = updateOrderRequest.order;
    order.status = updateOrderRequest.status;
    const orderRegistry = await getAssetRegistry(namespace + '.Order');
    await orderRegistry.update(order);
  
}






//// /////////////////////////////////////////////////////////new code ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Remove from readers of a particular medical the medical record
 * @param {org.lms.ehr.RemoveOthersToRead} removeOthersToRead
 * @transaction
 */
function removeOthersToRead(removeOthersToRead){
  var NS = 'org.lms.ehr';
   if(removeOthersToRead.medicalRecord.authorized){
     var index = removeOthersToRead.medicalRecord.authorized.indexOf(removeOthersToRead.UserId);
     if(index!=-1){
       removeOthersToRead.medicalRecord.authorized.splice(index, 1);
     }
   }
   return getAssetRegistry(NS+ '.MedicalRecords')
     .then((assets)=>{
         return assets.update(removeOthersToRead.medicalRecord);
     });
 
}

/**
* Add patients or doctors to read the medical records
* @param {org.lms.ehr.AllowOthersToRead} allowOthersToRead
* @transaction
*/
function allowOthersToRead(allowotherstoread){
 var NS = 'org.lms.ehr';
 if(allowotherstoread.medicalRecord.authorized){
   if(allowotherstoread.medicalRecord.authorized.indexOf(allowotherstoread.UserId)==-1){
     allowotherstoread.medicalRecord.authorized.push(allowotherstoread.UserId);  
   }
 }else{
   allowotherstoread.medicalRecord.authorized = [allowotherstoread.UserId];
 }
 
 return getAssetRegistry(NS+'.MedicalRecords').
     then((assets)=>{
       return assets.update(allowotherstoread.medicalRecord);
     });
}

/**
* Adding new Medical record to ledger
* @param {org.lms.ehr.AddnewMedicalRecord} addnewMedicalRecord
* @transaction
*/

function addnewMedicalRecord(record){
 var factory = getFactory();
 var NS = 'org.lms.ehr';
 
 var medicalrecord = factory.newResource(NS, 'MedicalRecords', record.transactionId);
 medicalrecord.patientId = record.patientId;
 medicalrecord.patient = record.patient;
 medicalrecord.patient_First_Name = record.patient_First_Name;
 medicalrecord.patient_Last_Name = record.patient_Last_Name;
 medicalrecord.description = record.description;
 medicalrecord.high = record.high;
 medicalrecord.weight = record.weight;

 medicalrecord.prescription = record.prescription;
 medicalrecord.Allergies = record.Allergies;
 medicalrecord.smoking = record.smoking;
 medicalrecord.app=record.app;
 
 return getAssetRegistry(NS +'.MedicalRecords')
     .then((medicalrecords)=>{
       return medicalrecords.add(medicalrecord);
       });
 
}

/**
 * Test that the specified asset is owned by the specified participant.
 * @param {Resource} asset The asset.
 * @param {Resource} participant The participant.
 * @return {boolean} True if yes, false if no.
 */
function testOwnership(asset, participant) {
    return asset.authorized == participant.getIdentifier();
}

