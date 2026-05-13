import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store';
import { Workout } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editWorkout?: Workout | null;
}

export default function AddWorkoutModal({ isOpen, onClose, editWorkout }: Props) {
  const addWorkout = useStore((state) => state.addWorkout);
  const updateWorkout = useStore((state) => state.updateWorkout);
  const [form, setForm] = useState({
    exercise: '',
    weight: 0,
    sets: 4,
    reps: 8,
    date: new Date().toISOString().split('T')[0],
  });

  // 当编辑的 workout 变化时，更新表单
  React.useEffect(() => {
    if (editWorkout) {
      setForm({
        exercise: editWorkout.exercise,
        weight: editWorkout.weight,
        sets: editWorkout.sets,
        reps: editWorkout.reps,
        date: editWorkout.date,
      });
    } else {
      setForm({
        exercise: '',
        weight: 0,
        sets: 4,
        reps: 8,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [editWorkout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editWorkout) {
      updateWorkout(editWorkout.id, form);
    } else {
      const workout: Workout = {
        id: Date.now().toString(),
        ...form,
      };
      addWorkout(workout);
    }
    setForm({ exercise: '', weight: 0, sets: 4, reps: 8, date: new Date().toISOString().split('T')[0] });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.37),
          0 0 0 1px rgba(255, 255, 255, 0.05) inset,
          0 1px 0 rgba(255, 255, 255, 0.15) inset
        `,
        width: '100%',
        maxWidth: '420px',
        padding: '28px',
      }}>
        <div className="flex items-center justify-end mb-6">
          <button onClick={onClose} style={{
            color: 'rgba(255, 255, 255, 0.5)',
            transition: 'all 0.2s ease',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }} onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={{ display: 'block', fontSize: '15px', color: 'rgba(255, 255, 255, 0.55)', marginBottom: '8px' }}>功法</label>
            <input
              type="text"
              value={form.exercise}
              onChange={(e) => setForm({ ...form, exercise: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '14px 16px',
                color: 'rgba(255, 255, 255, 0.92)',
                transition: 'all 0.25s ease',
                fontSize: '15px',
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                e.currentTarget.style.borderColor = 'rgba(139, 144, 184, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
              placeholder="如：卧推、深蹲"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255, 255, 255, 0.55)', marginBottom: '8px' }}>重量 (kg)</label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  color: 'rgba(255, 255, 255, 0.92)',
                  transition: 'all 0.25s ease',
                  fontSize: '15px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                  e.currentTarget.style.borderColor = 'rgba(139, 144, 184, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '15px', color: 'rgba(255, 255, 255, 0.55)', marginBottom: '8px' }}>组数</label>
              <input
                type="number"
                value={form.sets}
                onChange={(e) => setForm({ ...form, sets: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  color: 'rgba(255, 255, 255, 0.92)',
                  transition: 'all 0.25s ease',
                  fontSize: '15px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                  e.currentTarget.style.borderColor = 'rgba(139, 144, 184, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255, 255, 255, 0.55)', marginBottom: '8px' }}>次数</label>
              <input
                type="number"
                value={form.reps}
                onChange={(e) => setForm({ ...form, reps: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  color: 'rgba(255, 255, 255, 0.92)',
                  transition: 'all 0.25s ease',
                  fontSize: '15px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                  e.currentTarget.style.borderColor = 'rgba(139, 144, 184, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
                min="1"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '15px', color: 'rgba(255, 255, 255, 0.55)', marginBottom: '8px' }}>日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  color: 'rgba(255, 255, 255, 0.92)',
                  transition: 'all 0.25s ease',
                  fontSize: '15px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                  e.currentTarget.style.borderColor = 'rgba(139, 144, 184, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: '16px',
              fontSize: '15px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.7)',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              transition: 'all 0.25s ease',
            }} onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}>
              取消
            </button>
            <button type="submit" style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: '16px',
              fontSize: '15px',
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.95)',
              background: 'linear-gradient(135deg, rgba(139, 144, 184, 0.45), rgba(139, 144, 184, 0.25))',
              border: '1px solid rgba(139, 144, 184, 0.35)',
              boxShadow: '0 4px 24px rgba(139, 144, 184, 0.2)',
              transition: 'all 0.25s ease',
            }} onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 144, 184, 0.6), rgba(139, 144, 184, 0.35))';
              e.currentTarget.style.boxShadow = '0 6px 32px rgba(139, 144, 184, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 144, 184, 0.45), rgba(139, 144, 184, 0.25))';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(139, 144, 184, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              {editWorkout ? '加点' : '炼'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
