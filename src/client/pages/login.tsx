import * as React from 'react'
import { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPageComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const disabled = !username || username.length == 0 || !password || password.length == 0;

  const auth = () => {
    const method = "POST";
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ username, password, remember });
    fetch('/login', { method, headers, body})
    .then((res) => {
      console.log(res);
      if (res.status == 401) {
        return setErrorMessage('認証に失敗しました');
      }
      if (res.status == 200) {
        return location.href = res.url;
      }
    })
  }

  return (
    <div className="login-page">
      <div>LOGIN PAGE</div>
      <form action="/login" method="post">
        <div>
          <label>ユーザーID：</label>
          <input type="text" name="username" value={username} placeholder="ID" onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div>
          <label>パスワード：</label>
          <input type="password" name="password" value={password} placeholder="PASSWORD" onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <div>
          <input type="checkbox" name="remember" checked={remember} onChange={(e) => setRemember((e.target as HTMLInputElement).checked)} />
          <label>Remind Me</label>
        </div>
        {errorMessage &&
          <div className="error-message">{errorMessage}</div>
        }
        <div>
          <input disabled={disabled} type="button" value="ログイン" onClick={auth} />
        </div>
      </form>
      <Link to="/signup">新規登録</Link>
    </div>
  )
};

export default LoginPageComponent;

