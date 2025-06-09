"use client";
import React, { useState, useEffect } from "react";

function getDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function generateTasks(start: Date, end: Date) {
  const tasks: Record<string, Array<{ text: string; completed: boolean }>> = {};
  let current = new Date(start);
  while (current <= end) {
    const key = getDateKey(current);
    tasks[key] = [
      { text: "Reading Practice", completed: false },
      { text: "Writing Exercise", completed: false },
      { text: "Listening Drill", completed: false },
      { text: "Speaking Session", completed: false },
      { text: "Vocabulary Review", completed: false }
    ];
    current.setDate(current.getDate() + 1);
  }
  return tasks;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [today, setToday] = useState(new Date());
  const [testDate, setTestDate] = useState<Date | null>(null);
  const [tasksByDay, setTasksByDay] = useState<Record<string, Array<{ text: string; completed: boolean }>>>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedTestDate = localStorage.getItem('testDate');
    const savedTasks = localStorage.getItem('tasks');
    
    if (savedTestDate) {
      const date = new Date(savedTestDate);
      setTestDate(date);
      setSelectedDay(date);
    }
    
    if (savedTasks) {
      setTasksByDay(JSON.parse(savedTasks));
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (testDate) {
      localStorage.setItem('testDate', testDate.toISOString());
    } else {
      localStorage.removeItem('testDate');
    }
  }, [testDate]);

  useEffect(() => {
    if (Object.keys(tasksByDay).length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasksByDay));
    } else {
      localStorage.removeItem('tasks');
    }
  }, [tasksByDay]);

  // Handle task completion toggle
  const toggleTask = (date: Date, taskIndex: number) => {
    const dateKey = getDateKey(date);
    setTasksByDay(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map((task, idx) => 
        idx === taskIndex ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date());
    }, 60 * 1000); // update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (testDate) {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      const end = new Date(testDate);
      end.setHours(0, 0, 0, 0);
      if (end >= start) {
        setTasksByDay(generateTasks(start, end));
      } else {
        setTasksByDay({});
      }
    } else {
      setTasksByDay({});
    }
  }, [testDate, today]);

  function handleDayClick(day: number) {
    const clickedDate = new Date(currentYear, currentMonth, day);
    if (!testDate) {
      setTestDate(clickedDate);
      setSelectedDay(clickedDate);
    } else {
      setSelectedDay(clickedDate);
    }
  }

  function isInRange(day: number) {
    if (!testDate) return false;
    const d = new Date(currentYear, currentMonth, day);
    d.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(testDate);
    end.setHours(0, 0, 0, 0);
    return d >= start && d <= end;
  }

  function isTestDate(day: number) {
    if (!testDate) return false;
    const d = new Date(currentYear, currentMonth, day);
    return d.toDateString() === testDate.toDateString();
  }

  function isToday(day: number) {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  }

  function hasTasks(day: number) {
    const d = new Date(currentYear, currentMonth, day);
    return !!tasksByDay[getDateKey(d)];
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  // Helper to get all dates from today to testDate
  function getAllDatesFromTodayToTest() {
    if (!testDate) return [];
    const dates: Date[] = [];
    let current = new Date(today);
    current.setHours(0, 0, 0, 0);
    const end = new Date(testDate);
    end.setHours(0, 0, 0, 0);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  // Helper: is a date between selectedDay and testDate (inclusive)
  function isInSelectedRange(day: number) {
    if (!selectedDay || !testDate) return false;
    const d = new Date(currentYear, currentMonth, day);
    d.setHours(0, 0, 0, 0);
    const start = new Date(selectedDay);
    start.setHours(0, 0, 0, 0);
    const end = new Date(testDate);
    end.setHours(0, 0, 0, 0);
    // Ensure start <= end
    if (start > end) return d >= end && d <= start;
    return d >= start && d <= end;
  }

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
      padding: 32,
      width: 400,
      fontFamily: "system-ui, -apple-system, sans-serif",
      border: "1px solid #f5f5f5"
    }}>
      {/* Test date input */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ 
          color: "#d32f2f", 
          fontWeight: 600, 
          marginBottom: 8,
          display: "block",
          fontSize: "0.9rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          Select your Test Date
        </label>
        <input
          type="date"
          min={today.toISOString().split("T")[0]}
          value={testDate ? getDateKey(testDate) : ""}
          onChange={e => {
            const val = e.target.value;
            if (val) {
              const d = new Date(val);
              setTestDate(d);
              setSelectedDay(d);
            } else {
              setTestDate(null);
              setSelectedDay(null);
            }
          }}
          style={{
            border: "2px solid #ef5350",
            borderRadius: 8,
            padding: "8px 12px",
            color: "#d32f2f",
            width: "100%",
            fontSize: "1rem",
            outline: "none",
            transition: "all 0.2s ease",
            cursor: "pointer"
          }}
        />
      </div>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 24,
        padding: "0 8px"
      }}>
        <button 
          onClick={prevMonth} 
          style={{ 
            background: "none", 
            border: "none", 
            color: "#d32f2f", 
            fontSize: 24, 
            cursor: "pointer",
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            ':hover': { background: "#ffebee" }
          }}
        >←</button>
        <span style={{ 
          fontWeight: 700, 
          color: "#d32f2f",
          fontSize: "1.2rem"
        }}>
          {months[currentMonth]} {currentYear}
        </span>
        <button 
          onClick={nextMonth} 
          style={{ 
            background: "none", 
            border: "none", 
            color: "#d32f2f", 
            fontSize: 24, 
            cursor: "pointer",
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            ':hover': { background: "#ffebee" }
          }}
        >→</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "3px" }}>
        <thead>
          <tr>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <th key={d} style={{ 
                color: "#d32f2f", 
                fontWeight: 600, 
                padding: "8px 4px",
                fontSize: "0.85rem"
              }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil((daysInMonth + (firstDay === 0 ? 6 : firstDay - 1)) / 7) }).map((_, weekIdx) => (
            <tr key={weekIdx}>
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const dayNum = weekIdx * 7 + dayIdx - (firstDay === 0 ? 6 : firstDay - 1) + 1;
                if (dayNum < 1 || dayNum > daysInMonth) {
                  return <td key={dayIdx}></td>;
                }
                const isTest = isTestDate(dayNum);
                const todayCell = isToday(dayNum);
                const inRange = isInRange(dayNum);
                const hasTask = hasTasks(dayNum);
                const selected = selectedDay &&
                  new Date(currentYear, currentMonth, dayNum).toDateString() === selectedDay.toDateString();
                const inSelectedRange = isInSelectedRange(dayNum);

                let background = "none";
                let color = "#e53935";
                if (isTest) {
                  background = "#b71c1c";
                  color = "#fff";
                } else if (selected) {
                  background = "#e53935";
                  color = "#fff";
                } else if (inSelectedRange) {
                  background = "#e57373";
                  color = "#fff";
                } else if (hasTask) {
                  background = "#ffcdd2";
                }
                return (
                  <td key={dayIdx} style={{ padding: 0, textAlign: "center" }}>
                    <button
                      onClick={() => handleDayClick(dayNum)}
                      style={{
                        margin: 2,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: todayCell ? "2px solid #e53935" : "none",
                        background,
                        color,
                        fontWeight: isTest || selected || todayCell || inSelectedRange ? 700 : 400,
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                    >
                      {dayNum}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modified Task List */}
      {selectedDay && hasTasks(selectedDay.getDate()) && (
        <div style={{
          marginTop: 24,
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #ffcdd2",
          boxShadow: "0 4px 12px rgba(211, 47, 47, 0.1)"
        }}>
          <div style={{ 
            color: "#d32f2f", 
            fontWeight: 700, 
            marginBottom: 12,
            fontSize: "1.1rem"
          }}>
            Tasks for {selectedDay.toLocaleDateString()}
          </div>
          <div style={{ 
            margin: 0,
            color: "#e53935"
          }}>
            {tasksByDay[getDateKey(selectedDay)]?.map((task, idx) => (
              <label
                key={idx}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 8,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: task.completed ? '#ffebee' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(selectedDay, idx)}
                  style={{
                    marginRight: 12,
                    width: 18,
                    height: 18,
                    accentColor: '#e53935'
                  }}
                />
                <span style={{ 
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? '#888' : '#e53935',
                  fontSize: '0.95rem',
                  lineHeight: 1.4
                }}>
                  {task.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
      {/* Modified Complete Study Plan */}
      {testDate && (
        <div style={{
          marginTop: 32,
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #ef9a9a",
          boxShadow: "0 4px 12px rgba(211, 47, 47, 0.1)",
          maxHeight: 400,
          overflowY: "auto"
        }}>
          <div style={{ 
            color: "#d32f2f", 
            fontWeight: 700, 
            marginBottom: 16,
            fontSize: "1.1rem",
            borderBottom: "2px solid #ffcdd2",
            paddingBottom: 8
          }}>
            Your Complete Study Plan
          </div>
          <div style={{ 
            margin: 0,
            color: "#e53935"
          }}>
            {getAllDatesFromTodayToTest().map(date => (
              <div key={getDateKey(date)} style={{ marginBottom: 20 }}>
                <div style={{ 
                  fontWeight: 600, 
                  color: "#c62828",
                  fontSize: "1rem",
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{date.toLocaleDateString()}</span>
                  {testDate && getDateKey(date) === getDateKey(testDate) && (
                    <span style={{ 
                      color: "#d32f2f", 
                      fontWeight: 700,
                      background: "#ffebee",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: "0.85rem"
                    }}>
                      Test Day
                    </span>
                  )}
                </div>
                <div>
                  {tasksByDay[getDateKey(date)]?.map((task, idx) => (
                    <label
                      key={idx}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 6,
                        cursor: 'pointer',
                        padding: '6px 12px',
                        borderRadius: 4,
                        background: task.completed ? '#ffebee' : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(date, idx)}
                        style={{
                          marginRight: 12,
                          width: 16,
                          height: 16,
                          accentColor: '#e53935'
                        }}
                      />
                      <span style={{ 
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? '#888' : '#e57373',
                        fontSize: '0.9rem',
                        lineHeight: 1.4
                      }}>
                        {task.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button
          style={{
            background: "#d32f2f",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.9rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            transition: "all 0.2s ease",
            ':hover': {
              background: "#b71c1c",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.2)"
            }
          }}
          onClick={() => {
            setTestDate(null);
            setTasksByDay({});
            setSelectedDay(null);
          }}
        >
          Reset Plan
        </button>
      </div>
    </div>
  );
}
