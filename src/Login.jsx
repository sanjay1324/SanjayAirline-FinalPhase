import React, { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const decodeToken = (encodedToken) => {
    // Decode the token when needed
    const token = atob(encodedToken); // Decode the Base64 encoded token
    return token;
  };


  const handleLogin = async () => {
    try {
      const response = await fetch('https://localhost:7285/api/LoginAndRegisterAuthentication/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Username: username, Password: password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('role', data.role);
        const role = sessionStorage.getItem('role');
        if ( role == 'Admin') {
          const token = decodeToken(data.token);
          sessionStorage.setItem('token', token);
          toast.success('Welcome Admin');
          navigate('/Airports');
        }else if(role === 'User'){
          const token = decodeToken(data.token);
          sessionStorage.setItem('token', token);
          toast.success('Welcome Admin');
          navigate('/Airports');
        } 
        else {
          toast.error('Invalid username or password. Please try again.');
        }
    } else {
      toast.error('Invalid username or password. Please try again.');
    }
  }catch (error) {
    console.log(error)
    setMessage('An error occurred while trying to login.');
  }
}

  return (
    <Container className="mt-5">
      {/* <ToastContainer/> */}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Login
        </Button>

        <div className="mt-3">
          <a href="/register" className="custom-link">
            Don't Have An Account? Sign Up Here
          </a>
        </div>

        <div className="mt-2">
          <a href="/Password" className="custom-link1">
            Forgot Password
          </a>
        </div>

        <Form.Text className="text-danger">{message}</Form.Text>
      </Form>
    </Container>
  );
}

export default Login;
