
import React from 'react';
import { Customer, Resource, WorkType, ServiceMode, ResourceType } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com', address: '30 Market Street, San Francisco, CA' },
  { id: '2', name: 'Global Tech', email: 'hello@globaltech.io', address: '123 Tech Lane, Austin, TX' },
  { id: '3', name: 'Chris Temple', email: 'chris.temple@gmail.com', address: '45 Oak Ave, Seattle, WA' },
  { id: '4', name: 'Lori Stanley', email: 'lori.stanley@outlook.com', address: '88 Maple St, Boston, MA' },
];

export const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', name: 'Brooke Weaver', role: 'Field Technician', avatar: 'https://picsum.photos/seed/brooke/100/100', type: ResourceType.PERSON },
  { id: 'r2', name: 'Joe Bautista', role: 'Field Technician', avatar: 'https://picsum.photos/seed/joe/100/100', type: ResourceType.PERSON },
  { id: 'r3', name: 'Lawerence Vogt', role: 'Field Technician', avatar: 'https://picsum.photos/seed/lawrence/100/100', type: ResourceType.PERSON },
  { id: 'r4', name: 'Lori Stanley', role: 'Field Technician', avatar: 'https://picsum.photos/seed/lori/100/100', type: ResourceType.PERSON },
  { id: 'r5', name: 'Nathen Mora', role: 'Field Technician', avatar: 'https://picsum.photos/seed/nathen/100/100', type: ResourceType.PERSON },
  { id: 'r6', name: 'Stephanie Harris', role: 'Field Technician', avatar: 'https://picsum.photos/seed/stephanie/100/100', type: ResourceType.PERSON },
  { id: 'r7', name: 'Sam Brown', role: 'Field Technician', avatar: 'https://picsum.photos/seed/sam/100/100', type: ResourceType.PERSON },
  { id: 'r8', name: 'Jim Matthews', role: 'Field Technician', avatar: 'https://picsum.photos/seed/jim/100/100', type: ResourceType.PERSON },
  { id: 'r9', name: 'Conference Room A', role: 'Room', avatar: 'https://picsum.photos/seed/rooma/100/100', type: ResourceType.ASSET },
  { id: 'r10', name: 'Training Room B', role: 'Room', avatar: 'https://picsum.photos/seed/roomb/100/100', type: ResourceType.ASSET },
  { id: 'r11', name: 'Service Van #04', role: 'Vehicle', avatar: 'https://picsum.photos/seed/van/100/100', type: ResourceType.ASSET },
  { id: 'r12', name: 'Maintenance Truck #02', role: 'Vehicle', avatar: 'https://picsum.photos/seed/truck/100/100', type: ResourceType.ASSET },
  { id: 'r13', name: 'Emily Chen', role: 'Field Technician', avatar: 'https://picsum.photos/seed/emily/100/100', type: ResourceType.PERSON },
  { id: 'r14', name: 'Marcus Johnson', role: 'Field Technician', avatar: 'https://picsum.photos/seed/marcus/100/100', type: ResourceType.PERSON },
  { id: 'r15', name: 'Sarah Miller', role: 'Project Manager', avatar: 'https://picsum.photos/seed/sarah/100/100', type: ResourceType.PERSON },
  { id: 'r16', name: 'David Wilson', role: 'Senior Specialist', avatar: 'https://picsum.photos/seed/david/100/100', type: ResourceType.PERSON },
  { id: 'r17', name: 'Alex Rivera', role: 'Lead Engineer', avatar: 'https://picsum.photos/seed/alex/100/100', type: ResourceType.PERSON },
  { id: 'r18', name: 'Meeting Room C', role: 'Room', avatar: 'https://picsum.photos/seed/roomc/100/100', type: ResourceType.ASSET },
  { id: 'r19', name: 'Generator Unit #01', role: 'Equipment', avatar: 'https://picsum.photos/seed/gen/100/100', type: ResourceType.ASSET },
  { id: 'r20', name: 'Forklift #09', role: 'Vehicle', avatar: 'https://picsum.photos/seed/fork/100/100', type: ResourceType.ASSET },
  { id: 'r21', name: 'Technical Support Pod 4', role: 'Workspace', avatar: 'https://picsum.photos/seed/pod/100/100', type: ResourceType.ASSET },
];

export const STEP_LABELS = [
  'DEFINE CUSTOMER AND WORK TYPE',
  'PICK LOCATION',
  'SELECT SLOTS OR RESOURCES',
  'GROUP APPOINTMENT REQUIREMENTS',
  'REVIEW DETAILS'
];

export const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00'
];
