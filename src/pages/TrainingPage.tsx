import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Lock,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';
import { TacticalModal } from '../components/common/TacticalModal';
import { TacticalSelect, TacticalInput } from '../components/common/TacticalInputs';
import { TrainingCourse } from '../types';

export const TrainingPage: React.FC = () => {
  const { store, activeUser, trainingCourses, personnel } = useTacticalStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<TrainingCourse | null>(null);
  const [selectedSoldierId, setSelectedSoldierId] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const canManageTraining = ['System Administrator', 'Training Officer', 'Personnel Officer'].includes(activeUser.role);

  // Filter courses
  const filteredCourses = trainingCourses.filter((c) => {
    return (
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.requiredForRoles.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const totalCertified = trainingCourses.reduce((sum, c) => sum + c.certifiedCount, 0);
  const totalEnrolled = trainingCourses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const totalExpiringSoon = trainingCourses.reduce((sum, c) => sum + c.expiringIn30Days, 0);

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForEnroll || !selectedSoldierId) return;

    const soldier = personnel.find((p) => p.serviceId === selectedSoldierId);
    const soldierName = soldier ? `${soldier.rank} ${soldier.name}` : selectedSoldierId;

    const res = store.enrollInCourse(selectedCourseForEnroll.id, soldierName);
    setFeedbackMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setSelectedCourseForEnroll(null);
      setSelectedSoldierId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`rounded-lg border p-3 text-xs flex items-center justify-between ${
            feedbackMsg.error
              ? 'border-[#FF6464] bg-[#FF6464]/15 text-[#FF6464]'
              : 'border-[#48C774] bg-[#48C774]/15 text-[#48C774]'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="underline font-mono">
            Dismiss
          </button>
        </div>
      )}

      {/* Governance & Privacy Notice */}
      <div className="rounded-lg border border-[#465044] bg-[#202821] p-3 text-xs text-[#A9B39F] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="text-[#48C774]" size={16} />
          <span>
            <strong>Readiness Directives & Qualification Validity:</strong> Mandatory certifications (TCCC, CBRN, Weapons Marksmanship) determine combat deployment readiness.
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#B7AA83] bg-[#151A17] px-2 py-0.5 rounded border border-[#465044]">
          TOTAL QUALIFIED: {totalCertified}
        </span>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Active Qualifications</p>
          <p className="text-2xl font-bold font-mono text-[#48C774] mt-1 tabular-nums">{totalCertified}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Currently In Training</p>
          <p className="text-2xl font-bold font-mono text-[#62B7E8] mt-1 tabular-nums">{totalEnrolled}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Expiring &lt;30 Days</p>
          <p className="text-2xl font-bold font-mono text-[#F2B84B] mt-1 tabular-nums">{totalExpiringSoon}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Catalog Courses</p>
          <p className="text-2xl font-bold font-mono text-[#E8EBDD] mt-1 tabular-nums">{trainingCourses.length}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[#202821] p-3 rounded-lg border border-[#465044]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-[#747653]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses by code (e.g. TCCC), title, or required role..."
            className="w-full rounded border border-[#465044] bg-[#151A17] pl-9 pr-3 py-1.5 text-xs text-[#E8EBDD] placeholder-[#747653] focus:border-[#747653] focus:outline-none"
          />
        </div>
      </div>

      {/* Course Catalogue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((c) => {
          const totalCohort = c.certifiedCount + c.enrolledCount;
          const qualRate = Math.round((c.certifiedCount / (totalCohort || 1)) * 100);

          return (
            <TacticalCard
              key={c.id}
              title={`${c.code}: ${c.title}`}
              subtitle={`Validity: ${c.validityMonths} Months • Required for: ${c.requiredForRoles.join(', ')}`}
              badge={
                c.expiringIn30Days > 0 ? (
                  <span className="text-[10px] font-mono text-[#F2B84B] bg-[#F2B84B]/15 px-1.5 py-0.5 rounded border border-[#F2B84B]/40">
                    {c.expiringIn30Days} Expiring Soon
                  </span>
                ) : undefined
              }
              headerAction={
                canManageTraining && (
                  <TacticalButton
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onClick={() => setSelectedCourseForEnroll(c)}
                  >
                    Enroll Soldier
                  </TacticalButton>
                )
              }
            >
              <div className="space-y-3 text-xs">
                {/* Qualification Progress */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[#A9B39F]">Unit Certification Rate:</span>
                    <span className="text-[#48C774] font-bold tabular-nums">
                      {c.certifiedCount} Qualified ({qualRate}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded bg-[#151A17] overflow-hidden mt-1">
                    <div className="h-full bg-[#48C774]" style={{ width: `${qualRate}%` }} />
                  </div>
                </div>

                {/* Upcoming Scheduled Session */}
                <div className="p-3 bg-[#151A17] rounded border border-[#465044] space-y-1 font-mono text-[11px]">
                  <p className="text-[#B7AA83] font-semibold uppercase flex items-center gap-1.5">
                    <Calendar size={12} /> Upcoming Live Training Session:
                  </p>
                  <p className="text-[#E8EBDD]">Date: {c.upcomingSession.date}</p>
                  <p className="text-[#A9B39F]">Location: {c.upcomingSession.location}</p>
                  <p className="text-[#A9B39F]">
                    Instructor: {c.upcomingSession.instructor} • Open Seats:{' '}
                    <span className="text-[#48C774] font-bold">{c.upcomingSession.seatsAvailable}</span>
                  </p>
                </div>
              </div>
            </TacticalCard>
          );
        })}
      </div>

      {/* Modal: Enroll Personnel in Training */}
      <TacticalModal
        isOpen={!!selectedCourseForEnroll}
        onClose={() => setSelectedCourseForEnroll(null)}
        title={`Enroll Service Member: ${selectedCourseForEnroll?.code}`}
        subtitle={`Course: ${selectedCourseForEnroll?.title}`}
        maxWidth="md"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
          <TacticalSelect
            label="Select Service Member to Enroll"
            value={selectedSoldierId}
            onChange={(e) => setSelectedSoldierId(e.target.value)}
            required
          >
            <option value="">-- Select Personnel --</option>
            {personnel.map((p) => (
              <option key={p.serviceId} value={p.serviceId}>
                {p.rank} {p.name} ({p.unit} - {p.serviceId})
              </option>
            ))}
          </TacticalSelect>

          <div className="p-3 bg-[#151A17] rounded border border-[#465044] font-mono text-[11px] text-[#A9B39F] space-y-1">
            <p className="text-[#B7AA83] font-semibold">ENROLLMENT AUDIT DETAILS:</p>
            <p>Training Officer: {activeUser.displayName}</p>
            <p>Session Date: {selectedCourseForEnroll?.upcomingSession.date}</p>
            <p>Certification Expiry: +{selectedCourseForEnroll?.validityMonths} Months from completion</p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setSelectedCourseForEnroll(null)}>
              Cancel
            </TacticalButton>
            <TacticalButton type="submit" variant="primary" size="sm">
              Authorize Enrollment
            </TacticalButton>
          </div>
        </form>
      </TacticalModal>
    </div>
  );
};
