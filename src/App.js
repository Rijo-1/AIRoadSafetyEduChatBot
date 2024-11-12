import React, { useState, useEffect } from 'react';
import { Groq } from 'groq-sdk';

const RoadSafetyChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState('');
  const [quizMode, setQuizMode] = useState(false);
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    questions: [],
    answers: [],
    score: 0
  });
  const [userProgress, setUserProgress] = useState({
    modules: {
      'Road Signs and Signals': { completed: false, score: 0, attempts: 0, weakTopics: [] },
      'Traffic Rules and Regulations': { completed: false, score: 0, attempts: 0, weakTopics: [] },
      'Defensive Driving': { completed: false, score: 0, attempts: 0, weakTopics: [] },
      'Emergency Procedures': { completed: false, score: 0, attempts: 0, weakTopics: [] },
      'Vehicle Safety Checks': { completed: false, score: 0, attempts: 0, weakTopics: [] }
    },
    overallProgress: 0,
    predictedScore: null,
    learningStyle: null,
    recommendedTopics: []
  });

  const apiKey = "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";
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    const initialPrompt = `You are a road safety instructor. Welcome the user and explain that each module will have:
    1. Learning content
    2. Practice questions
    3. Final quiz
    4. Personalized feedback
    
    List the available modules:
    1. Road Signs and Signals
    2. Traffic Rules and Regulations
    3. Defensive Driving
    4. Emergency Procedures
    5. Vehicle Safety Checks`;

    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'system', content: initialPrompt }],
        model: 'llama3-8b-8192',
      });
      setMessages([{ role: 'assistant', content: response.choices[0].message.content }]);
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  const startQuiz = async () => {
    setQuizMode(true);
    const quizPrompt = `Generate 5 multiple-choice questions for the ${currentModule} module. 
    Consider the user's weak areas: ${userProgress.modules[currentModule]?.weakTopics.join(', ')}.
    Make questions progressively harder.
    Format: Question|Option A|Option B|Option C|Option D|Correct Answer (A/B/C/D)|Explanation`;

    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'system', content: quizPrompt }],
        model: 'llama3-8b-8192',
      });

      const quizContent = response.choices[0].message.content;
      const questions = parseQuizQuestions(quizContent);
      setQuizState({
        currentQuestion: 0,
        questions: questions,
        answers: [],
        score: 0
      });

      displayCurrentQuestion(questions[0]);
    } catch (error) {
      console.error('Quiz generation error:', error);
    }
  };

  const parseQuizQuestions = (quizContent) => {
    // Split content into individual questions
    return quizContent.split('\n')
      .filter(line => line.trim())
      .map(question => {
        const [q, a, b, c, d, correct, explanation] = question.split('|').map(s => s.trim());
        return { question: q, options: [a, b, c, d], correct, explanation };
      });
  };

  const displayCurrentQuestion = (question) => {
    const questionDisplay = `
Question ${quizState.currentQuestion + 1}/5:
${question.question}

A) ${question.options[0]}
B) ${question.options[1]}
C) ${question.options[2]}
D) ${question.options[3]}

Please answer with A, B, C, or D.`;

    setMessages(prev => [...prev, { role: 'assistant', content: questionDisplay }]);
  };

  const processQuizAnswer = async (answer) => {
    const currentQ = quizState.questions[quizState.currentQuestion];
    const isCorrect = answer.toUpperCase() === currentQ.correct;
    const newAnswers = [...quizState.answers, { answer, correct: isCorrect }];
    const newScore = quizState.score + (isCorrect ? 1 : 0);

    // Store answer and update score
    setQuizState(prev => ({
      ...prev,
      answers: newAnswers,
      score: newScore
    }));

    // Provide immediate feedback
    const feedback = `${isCorrect ? '✓ Correct!' : '✗ Incorrect.'}
${currentQ.explanation}`;
    setMessages(prev => [...prev, { role: 'assistant', content: feedback }]);

    // Move to next question or end quiz
    if (quizState.currentQuestion < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
      setTimeout(() => displayCurrentQuestion(quizState.questions[quizState.currentQuestion + 1]), 1500);
    } else {
      await endQuiz(newAnswers, newScore);
    }
  };

  const endQuiz = async (finalAnswers, finalScore) => {
    setQuizMode(false);
    const scorePercentage = (finalScore / quizState.questions.length) * 100;

    // Update module progress
    const updatedModules = {
      ...userProgress.modules,
      [currentModule]: {
        ...userProgress.modules[currentModule],
        score: scorePercentage,
        attempts: userProgress.modules[currentModule].attempts + 1,
        completed: scorePercentage >= 70,
        weakTopics: identifyWeakTopics(finalAnswers, quizState.questions)
      }
    };

    // Generate personalized feedback
    const feedbackPrompt = `
    Generate personalized feedback based on quiz performance:
    Module: ${currentModule}
    Score: ${scorePercentage}%
    Weak Topics: ${updatedModules[currentModule].weakTopics.join(', ')}
    Previous Attempts: ${updatedModules[currentModule].attempts}
    
    Include:
    1. Score analysis
    2. Areas for improvement
    3. Specific study recommendations
    4. Predicted final performance
    5. Next steps`;

    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'system', content: feedbackPrompt }],
        model: 'llama3-8b-8192',
      });

      const feedback = response.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: feedback }]);

      // Update overall progress and predictions
      updateProgressAndPredictions(updatedModules);
    } catch (error) {
      console.error('Feedback generation error:', error);
    }
  };

  const identifyWeakTopics = (answers, questions) => {
    return answers
      .map((answer, index) => (!answer.correct ? questions[index].question.split(' ')[0] : null))
      .filter(topic => topic !== null);
  };

  const updateProgressAndPredictions = (updatedModules) => {
    const completedModules = Object.values(updatedModules).filter(m => m.completed).length;
    const averageScore = Object.values(updatedModules)
      .filter(m => m.attempts > 0)
      .reduce((acc, m) => acc + m.score, 0) / completedModules || 0;

    // Calculate predicted final score using a weighted algorithm
    const predictedScore = calculatePredictedScore(updatedModules);

    setUserProgress(prev => ({
      ...prev,
      modules: updatedModules,
      overallProgress: (completedModules / Object.keys(updatedModules).length) * 100,
      predictedScore: predictedScore,
      recommendedTopics: generateRecommendations(updatedModules)
    }));
  };

  const calculatePredictedScore = (modules) => {
    const weights = {
      currentScores: 0.4,
      attemptProgress: 0.2,
      topicMastery: 0.2,
      learningRate: 0.2
    };

    const moduleValues = Object.values(modules);
    const avgScore = moduleValues.reduce((acc, m) => acc + m.score, 0) / moduleValues.length;
    const avgAttempts = moduleValues.reduce((acc, m) => acc + m.attempts, 0) / moduleValues.length;
    const topicMastery = moduleValues.reduce((acc, m) => acc + (m.weakTopics.length ? 0 : 1), 0) / moduleValues.length;
    const learningRate = moduleValues
      .filter(m => m.attempts > 1)
      .reduce((acc, m) => acc + (m.score / m.attempts), 0) / moduleValues.length || 1;

    return (
      avgScore * weights.currentScores +
      (avgAttempts / 3) * 100 * weights.attemptProgress +
      topicMastery * 100 * weights.topicMastery +
      learningRate * weights.learningRate
    );
  };

  const generateRecommendations = (modules) => {
    return Object.entries(modules)
      .filter(([_, data]) => data.attempts > 0 && data.score < 70)
      .map(([module, data]) => ({
        module,
        topics: data.weakTopics,
        priority: (70 - data.score) / 10
      }))
      .sort((a, b) => b.priority - a.priority)
      .map(rec => rec.module);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (quizMode) {
      if (/^[A-Da-d]$/.test(input.trim())) {
        await processQuizAnswer(input.trim());
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Please answer with A, B, C, or D only.' 
        }]);
      }
    } else {
      try {
        // Handle module selection
        const moduleMatch = input.match(/module\s*(\d+)/i);
        if (moduleMatch) {
          const modules = [
            'Road Signs and Signals',
            'Traffic Rules and Regulations',
            'Defensive Driving',
            'Emergency Procedures',
            'Vehicle Safety Checks'
          ];
          setCurrentModule(modules[parseInt(moduleMatch[1]) - 1]);
        }

        // Handle "start quiz" command
        if (input.toLowerCase().includes('start quiz')) {
          await startQuiz();
        } else {
          // Normal conversation
          const response = await groq.chat.completions.create({
            messages: [
              { 
                role: 'system', 
                content: `Current module: ${currentModule}
                         Progress: ${JSON.stringify(userProgress)}
                         Maintain context and provide relevant responses.`
              },
              ...messages,
              userMessage
            ],
            model: 'llama3-8b-8192',
          });

          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: response.choices[0].message.content 
          }]);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'An error occurred. Please try again.' 
        }]);
      }
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{message.role === 'user' ? 'You: ' : 'Instructor: '}</strong>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{message.content}</pre>
          </div>
        ))}
        {loading && <div>Loading...</div>}
      </div>

      <div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          rows="3"
          placeholder={quizMode ? "Enter A, B, C, or D" : "Type your message here..."}
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>

      {userProgress.predictedScore !== null && (
        <div style={{ marginTop: '10px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>Learning Progress Summary</h3>
          <p>Overall Progress: {userProgress.overallProgress.toFixed(1)}%</p>
          <p>Predicted Final Score: {userProgress.predictedScore.toFixed(1)}%</p>
          {userProgress.recommendedTopics.length > 0 && (
            <div>
              <p>Recommended Focus Areas:</p>
              <ul>
                {userProgress.recommendedTopics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoadSafetyChatbot;