import React, { useState, useEffect } from 'react';
import { Groq } from 'groq-sdk';
import styled, { createGlobalStyle } from 'styled-components';


const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    background-color: #f5f5f5;
    color: #333;
    margin: 0;
    padding: 0;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 2rem;
`;

const Header = styled.header`
  width: 100%;
  max-width: 800px;
  height: 50px;
  background-color: #007bff;
  color: #fff;
  border-radius: 12px 12px 0 0;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
`;

const HeaderSubtitle = styled.p`
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 0;
`;

const ChatContainer = styled.div`
  width: 100%;
  max-width: 800px;
  height: 500px;
  background-color: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.isUser ? 'row-reverse' : 'row')};
  align-items: center;
  margin-bottom: 1.2rem;
`;

const MessageBubble = styled.div`
  background-color: ${(props) => (props.isUser ? '#007bff' : '#f0f0f0')};
  color: ${(props) => (props.isUser ? '#fff' : '#333')};
  padding: 0.8rem 1.2rem;
  border-radius: 1.2rem;
  max-width: 70%;
  white-space: pre-wrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const InputContainer = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const Input = styled.textarea`
  flex-grow: 1;
  padding: 0.8rem 1.2rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  resize: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  }
`;

const Button = styled.button`
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.2);
  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: #0056b3;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProgressTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: #007bff;
`;

const ProgressText = styled.p`
  margin-top: 0;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
`;

const RecommendedTopicsContainer = styled.div`
  margin-top: 1rem;
`;

const RecommendedTopicsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const RecommendedTopicItem = styled.li`
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

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
    const initialPrompt = `You are an Indian road safety instructor. Welcome the user and explain that each module will have:
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
    Make questions progressively harder and donot include questions based on images.
    Format: Question|Option A|Option B|Option C|Option D`;

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
    return quizContent.split('\n')
      .filter(line => line.trim())
      .map(question => {
        const [q, a, b, c, d, explanation] = question.split('|').map(s => s.trim());
        return { question: q, options: [a, b, c, d], explanation };
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

    setQuizState(prev => ({
      ...prev,
      answers: newAnswers,
      score: newScore
    }));

    const feedback = `${isCorrect ? '✓ Correct!' : '✗ Incorrect.'}
${currentQ.explanation}`;
    setMessages(prev => [...prev, { role: 'assistant', content: feedback }]);

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

        if (input.toLowerCase().includes('start quiz')) {
          await startQuiz();
        } else {
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
    <>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <HeaderTitle>Road Safety Chatbot</HeaderTitle>
          <HeaderSubtitle>Learn, Practice, and Improve Your Road Safety Knowledge</HeaderSubtitle>
        </Header>
        <ChatContainer>
          {messages.map((message, index) => (
            <MessageContainer key={index} isUser={message.role === 'user'}>
              <MessageBubble isUser={message.role === 'user'}>
                {message.content}
              </MessageBubble>
            </MessageContainer>
          ))}
          {loading && <div>Loading...</div>}
        </ChatContainer>
        <InputContainer>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={quizMode ? "Enter A, B, C, or D" : "Type your message here..."}
          />
          <Button onClick={handleSend} disabled={loading}>
            Send
          </Button>
        </InputContainer>
        {userProgress.predictedScore !== null && (
          <ProgressContainer>
            <ProgressTitle>Learning Progress Summary</ProgressTitle>
            <ProgressText>Overall Progress: {userProgress.overallProgress.toFixed(1)}%</ProgressText>
            <ProgressText>Predicted Final Score: {userProgress.predictedScore.toFixed(1)}%</ProgressText>
            {userProgress.recommendedTopics.length > 0 && (
              <RecommendedTopicsContainer>
                <ProgressText>Recommended Focus Areas:</ProgressText>
                <RecommendedTopicsList>
                  {userProgress.recommendedTopics.map((topic, index) => (
                    <RecommendedTopicItem key={index}>{topic}</RecommendedTopicItem>
                  ))}
                </RecommendedTopicsList>
              </RecommendedTopicsContainer>
            )}
          </ProgressContainer>
        )}
      </AppContainer>
    </>
  );
};

export default RoadSafetyChatbot;