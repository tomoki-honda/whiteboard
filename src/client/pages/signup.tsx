import * as React from 'react'
import { useState } from 'react';

interface ResponseBody {
  ok: boolean;
  code: number;
  msg: {
    ja: string;
    en: string;
  }
}

const SignUpPageComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const disabled = !username || username.length == 0 || !password || password.length == 0 || !password2 || password2.length == 0;

  const request = () => {
    const method = "POST";
    const headers = { 'Content-Type': 'application/json' }
    const body = JSON.stringify({ username, password });
    console.log(body.toString());
    fetch('/api/create', { method, body, headers }).then(async res => {
      const val = (await res.body?.getReader()?.read())?.value;
      if (!val) {
        console.error(val);
        return;
      }
      const obj = JSON.parse((new TextDecoder).decode(val.buffer));
      if (obj.ok) {
        alert('新規登録完了')
        location.href = '/profile?id=' + obj.id;
      } else {
        alert(obj.msg.ja)
      }
    })
  }

  return (
    <div className="login-page">
      <div>LOGIN PAGE</div>
      <form action="/api/create" method="post">
        <div>
          <label>ユーザーID：</label>
          <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div>
          <label>パスワード：</label>
          <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <div>
          <label>パスワード（再入力）：</label>
          <input type="password" name="password2" value={password2} onChange={(e) => setPassword2(e.target.value)}/>
        </div>
        {password && password2 && password != password2 &&
          <div>パスワードが異なっています</div>
        }
        <input disabled={disabled} type="button" value="新規登録" onClick={request}/>
      </form>
    </div>
  )
};

export default SignUpPageComponent;

