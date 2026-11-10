import type { Component } from 'vue'
export type TripStatus = 'upcoming' | 'active' | 'completed'
export type MemberRole = 'organizer' | 'viewer'
export interface Trip {
  id: string
  name: string
  country: string
  start: string
  end: string
  image: string
  status: TripStatus
  archived: boolean
  notes: string
  role: MemberRole
}
export interface PlanEvent {
  id: string
  tripId: string
  day: string
  title: string
  start: string
  end: string
  place: string
  description: string
  image: string
  category: string
}
export interface Place {
  id: string
  name: string
  category: string
  address: string
  image: string
  description: string
}
export interface TripPlace {
  tripId: string
  placeId: string
}
export interface ChecklistItem {
  id: string
  title: string
  checked: boolean
}
export interface Checklist {
  id: string
  tripId: string
  title: string
  items: ChecklistItem[]
}
export interface Participant {
  id: string
  tripId: string
  name: string
  email: string
  role: MemberRole
  color: string
}
export interface Expense {
  id: string
  tripId: string
  title: string
  category: string
  amount: number
}
export interface Profile {
  name: string
  email: string
  notifications: boolean
}
export interface SelectOption {
  label: string
  value: string
}
export interface NavItem {
  label: string
  to: string
  icon: Component
}
