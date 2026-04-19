import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { Spinner, EmptyState } from '../../components/UI';

const priorityColors = {
  critical: 'border-red-400 bg-red-50',
  high: 'border-orange-400 bg-orange-50',
  medium: 'border-yellow-400 bg-yellow-50',
  low: 'border-green-400 bg-green-50',
};

const AISuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: '👋 Hi! I\'m your AI study assistant. Ask me anything about time management, study tips, or your tasks!' }
  ]);

  useEffect(() => {
    API.get('/tasks/ai/suggestions').then(({ data }) => {
      setSuggestions(data.suggestions);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Simple rule-based chatbot
  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.toLowerCase();
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatInput('');

    let response = '';
    if (userMsg.includes('deadline') || userMsg.includes('urgent')) {
      response = '⏰ For urgent deadlines: Break the task into 25-min Pomodoro sessions. Focus on the most critical parts first. Avoid multitasking!';
    } else if (userMsg.includes('study') || userMsg.includes('plan')) {
      response = '📚 Study Planning Tips:\n1. Review your AI priority list daily\n2. Study hardest subjects when energy is highest\n3. Take 5-min breaks every 25 mins\n4. Review notes within 24 hours of class';
    } else if (userMsg.includes('stress') || userMsg.includes('overwhelm')) {
      response = '🧘 Managing Stress:\n1. Prioritize top 3 tasks for today only\n2. Take short walks between study sessions\n3. Get 7-8 hours of sleep\n4. Break large tasks into smaller steps';
    } else if (userMsg.includes('time') || userMsg.includes('manage')) {
      response = '⏱️ Time Management:\n1. Use the Eisenhower Matrix (urgent vs important)\n2. Block time for deep work (2-3 hour sessions)\n3. Batch similar tasks together\n4. Review your schedule every morning';
    } else if (userMsg.includes('exam') || userMsg.includes('test')) {
      response = '📝 Exam Preparation:\n1. Start 1 week before — review notes daily\n2. Practice past papers\n3. Teach concepts to others\n4. Sleep well the night before!';
    } else if (userMsg.includes('hello') || userMsg.includes('hi')) {
      response = '👋 Hello! How can I help you today? Ask me about study planning, time management, or dealing with deadlines!';
    } else {
      response = '🤖 I can help with: study planning, time management, deadline strategies, exam prep, and stress management. What would you like to know?';
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 500);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">🤖 AI Smart Suggestions</h1>
        <p className="text-purple-100 mt-1">Personalized task prioritization based on deadlines & workload</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Task Suggestions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">📋 Prioritized Task List</h3>
          {suggestions.length === 0 ? (
            <EmptyState icon="🎉" message="No pending tasks! You're all caught up." />
          ) : (
            suggestions.map((s, i) => (
              <div key={s.taskId} className={`border-l-4 rounded-xl p-4 ${priorityColors[s.priority] || 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                    <h4 className="font-semibold text-gray-800">{s.title}</h4>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                    Score: {s.aiScore}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{s.advice}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>📅 Due: {new Date(s.deadline).toLocaleDateString()}</span>
                  <span>⏰ {s.hoursLeft}h left</span>
                  <span>⏱️ ~{s.estimatedHours}h work</span>
                </div>
              </div>
            ))
          )}

          {/* Study Tips */}
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <h4 className="font-semibold text-blue-800 mb-3">💡 Smart Study Tips</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              {[
                'Use Pomodoro: 25 min focus + 5 min break',
                'Tackle high-priority tasks in the morning',
                'Review notes within 24 hours of class',
                'Break large projects into daily milestones',
                'Avoid multitasking — single-task for deep work',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold flex-shrink-0">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Chatbot */}
        <div className="card flex flex-col h-[600px]">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg">
              🤖
            </div>
            <div>
              <p className="font-semibold text-gray-800">AI Study Assistant</p>
              <p className="text-xs text-green-500 font-medium">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line
                  ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleChat} className="flex gap-2">
            <input
              className="input-field flex-1 text-sm"
              placeholder="Ask about study tips, deadlines..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button type="submit" className="btn-primary px-4">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
