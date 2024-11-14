import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { validateLoginForm } from '../backend/validations/users';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate the login form
      if (!validateLoginForm({ email, password })) {
        return alert('Please check your email and password');
      }

      // Send the login request to the backend
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user, token } = await response.json();
        console.log('Logged in:', user);

        // Save the token in a secure cookie
        document.cookie = `token=${token}; HttpOnly; Secure; SameSite=Strict`;

        // Redirect the user to the main App.js file
        setIsLoggedIn(true);
        navigate('/');
      } else {
        const { message } = await response.json();
        console.error('Login error:', message);
        alert(message);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <Container>
      <Header>AI Road Safety Bot</Header>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </InputGroup>
        <SubmitButton type="submit">Log in</SubmitButton>
      </Form>
      <Footer>
        Don't have an account? <a href="/register">Register</a>
      </Footer>
    </Container>)
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Header = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  background-color: white;
  padding: 6rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 400px;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #2980b9;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: #2980b9;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2c3e50;
  }
`;

const Footer = styled.div`
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #2c3e50;

  a {
    color: #2980b9;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default LoginPage;