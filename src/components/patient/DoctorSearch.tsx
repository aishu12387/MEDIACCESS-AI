import React, { useState, useMemo } from 'react';
import { Doctor, User, Appointment } from '../../types';
import { dataStore } from '../../services/dataStore';
import { voiceService } from '../../services/voiceAssistant';
import { soundService } from '../../services/soundService';
import {
  Search,
  Mic,
  Star,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Filter,
  DollarSign,
  UserCheck,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';

interface DoctorSearchProps {
  user: User;
  onAppointmentBooked?: (appointment: Appointment) => void;
  initialQuery?: string;
  initialSpecialization?: string;
  initialMaxFee?: number;
}

export const DoctorSearch: React.FC<DoctorSearchProps> = ({
  user,
  onAppointmentBooked,
  initialQuery = '',
  initialSpecialization = 'All',
  initialMaxFee,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialization);
  const [maxFee, setMaxFee] = useState<number | undefined>(initialMaxFee);
  const [selectedGender, setSelectedGender] = useState<'all' | 'female' | 'male'>('all');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);

  // Booking Modal State
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState(() => {
    return new Date(Date.now() + 86400000).toISOString().split('T')[0]; // tomorrow
  });
  const [bookingTime, setBookingTime] = useState('17:00');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState('');

  const doctors = dataStore.getDoctors();

  const specialties = ['All', 'Cardiology', 'Dermatology', 'Neurology', 'General Medicine', 'Pediatrics', 'Orthopedics'];

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      // Specialty
      if (selectedSpecialty !== 'All' && doc.specialization.toLowerCase() !== selectedSpecialty.toLowerCase()) {
        return false;
      }
      // Max Fee
      if (maxFee !== undefined && doc.fee > maxFee) {
        return false;
      }
      // Gender
      if (selectedGender !== 'all' && doc.gender !== selectedGender) {
        return false;
      }
      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesSpec = doc.specialization.toLowerCase().includes(q);
        const matchesLoc = doc.location.toLowerCase().includes(q);
        const matchesClinic = doc.clinicName.toLowerCase().includes(q);
        if (!matchesName && !matchesSpec && !matchesLoc && !matchesClinic) {
          return false;
        }
      }
      return true;
    });
  }, [doctors, selectedSpecialty, maxFee, selectedGender, searchQuery]);

  const handleOpenBooking = (doc: Doctor) => {
    setSelectedDoctorForBooking(doc);
    setBookingSuccessMessage('');
    soundService.announce(`Selected ${doc.name}. Choose appointment date and time.`);
  };

  const handleConfirmBooking = () => {
    if (!selectedDoctorForBooking) return;

    const newApt = dataStore.createAppointment({
      patientId: user.id,
      patientName: user.name,
      patientAccessibilityMode: user.accessibilitySettings.mode,
      doctorId: selectedDoctorForBooking.id,
      doctorName: selectedDoctorForBooking.name,
      doctorSpecialization: selectedDoctorForBooking.specialization,
      doctorAvatar: selectedDoctorForBooking.avatar,
      date: bookingDate,
      time: bookingTime,
      status: 'confirmed',
      fee: selectedDoctorForBooking.fee,
      notes: bookingNotes || 'Regular Accessible Consultation',
      meetLink: `/consultation/apt-${Date.now()}`,
    });

    soundService.playSuccess();
    const msg = `Your appointment with ${selectedDoctorForBooking.name} has been successfully booked for ${bookingDate} at ${bookingTime}.`;
    setBookingSuccessMessage(msg);
    soundService.speak(msg);

    setTimeout(() => {
      setSelectedDoctorForBooking(null);
      if (onAppointmentBooked) onAppointmentBooked(newApt);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Find & Book Specialist Doctors
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Search top practitioners by voice, specialty, location, or consultation fee.
          </p>
        </div>

        {/* Search Input with Microphone Shortcut */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialization (e.g. Cardiologist), or clinic..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-sm sm:text-base font-medium shadow-xs"
              aria-label="Search doctors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              voiceService.startListening();
            }}
            className="flex items-center gap-2 px-5 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-teal-600/30 transition-all shrink-0 focus:outline-hidden focus:ring-4 focus:ring-teal-400"
            title="Speak doctor search command"
          >
            <Mic className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline">Voice Search</span>
          </button>
        </div>

        {/* Specialization Filter Pills */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Medical Specialization
          </span>
          <div className="flex flex-wrap gap-2">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters (Fee < 500, Gender) */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              Quick Filters:
            </span>

            <button
              onClick={() => setMaxFee(maxFee === 500 ? undefined : 500)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                maxFee === 500
                  ? 'bg-teal-100 text-teal-900 border-teal-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              💰 Fee under ₹500
            </button>

            <button
              onClick={() =>
                setSelectedGender(selectedGender === 'female' ? 'all' : 'female')
              }
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                selectedGender === 'female'
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              👩 Female Doctors
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-800">{filteredDoctors.length}</strong> verified doctors
          </span>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <p className="text-lg font-bold text-slate-700">No doctors matched your criteria.</p>
            <p className="text-sm text-slate-500">
              Try saying: "Find a cardiologist" or clear active filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('All');
                setMaxFee(undefined);
                setSelectedGender('all');
              }}
              className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-teal-500 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                {/* Doctor Avatar & Badges */}
                <div className="flex items-start gap-4">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shrink-0 shadow-sm"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                        {doc.name}
                      </h3>
                      {doc.isVerified && (
                        <span title="Verified Medical Practitioner">
                          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-teal-700">{doc.specialization}</p>
                    <p className="text-xs text-slate-500 font-medium">{doc.qualifications}</p>
                  </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Experience</span>
                    <strong className="text-slate-800 font-bold">{doc.experienceYears}+ Years</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Consultation Fee</span>
                    <strong className="text-teal-700 font-bold text-sm">₹{doc.fee}</strong>
                  </div>
                </div>

                {/* Rating & Location */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{doc.rating}</span>
                    <span className="text-slate-400 font-normal">({doc.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.clinicName}, {doc.location}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {doc.bio}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Available Tomorrow
                </span>
                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all focus:outline-hidden focus:ring-4 focus:ring-teal-400"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Booking Modal */}
      {selectedDoctorForBooking && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctorForBooking.avatar}
                  alt={selectedDoctorForBooking.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-teal-500"
                />
                <div>
                  <h3 id="booking-modal-title" className="text-lg font-black text-slate-900">
                    Book {selectedDoctorForBooking.name}
                  </h3>
                  <p className="text-xs text-teal-700 font-semibold">
                    {selectedDoctorForBooking.specialization} • ₹{selectedDoctorForBooking.fee}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctorForBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                aria-label="Close booking modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-xl font-black text-slate-900">Appointment Confirmed!</h4>
                <p className="text-sm text-slate-600">{bookingSuccessMessage}</p>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Select Available Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDoctorForBooking.availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingTime(slot)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          bookingTime === slot
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Medical Concern / Reason for Visit
                  </label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="e.g. Follow up on blood pressure, mild chest tightness..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Voice Confirmation Note */}
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-xs">
                  🗣️ <strong>Voice-First Tip:</strong> You can also book this instantly at any time by speaking: <em>"Book {selectedDoctorForBooking.name} tomorrow at 5 PM"</em>.
                </div>

                {/* Confirmation Action */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctorForBooking(null)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-xl shadow-lg shadow-teal-600/30 transition-all focus:outline-hidden focus:ring-4 focus:ring-teal-400"
                  >
                    Confirm & Book Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
