import { useState } from 'react';
import { WorkoutList, AddWorkoutModal, TestList } from '../components/Fitness';
import { BackButton } from '../components/Layout';
import { Workout } from '../types';

export default function FitnessPage() {
  const [showModal, setShowModal] = useState(false);
  const [editWorkout, setEditWorkout] = useState<Workout | null>(null);

  const handleOpenAdd = () => {
    setEditWorkout(null);
    setShowModal(true);
  };

  const handleEdit = (workout: Workout) => {
    setEditWorkout(workout);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditWorkout(null);
  };

  return (
    <div className="min-h-screen relative pt-16">
      {/* Fitness ambient glow - red energy */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 60% 40% at 90% 5%, rgba(239,68,68,0.10) 0%, transparent 70%)'
      }} />
      <BackButton />
      <main className="p-6 lg:p-8 relative z-10">
        <div className="max-w-6xl mx-auto">

          <div className="mb-6">
            <TestList />
          </div>

          <div className="flex justify-end mb-4">
            <button onClick={handleOpenAdd} className="btn-primary">
              锻体
            </button>
          </div>

          <WorkoutList onEdit={handleEdit} />
        </div>
      </main>

      <AddWorkoutModal isOpen={showModal} onClose={handleClose} editWorkout={editWorkout} />
    </div>
  );
}
