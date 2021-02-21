import * as express from 'express';
import * as path from 'path';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
const LocalStrategy = passportLocal.Strategy;
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as crypto from 'crypto';

import { server } from './constants/application';
import { env } from './constants/env';

import { User } from './models/user';
import { CREATE_RESPONSE_ERROR } from '../common/enum/errorCode';
import IUserDocument from './models/interface/IUserDocument';

const PORT = process.env.PORT || server.port;
const app = express();
//
// // mongoose.connect('mongodb://db/')
// mongoose.connect('mongodb://localhost:27017/')
//   .then(val => {
//     // console.log("mongo db connect success.", val);
//   })
//   .catch(reason => {
//     console.log("mongo db error.", reason);
//   });

const authMiddleware = (req: any, res: any, next: any) => {
  console.log("authMiddleware", req.isAuthenticated(), req.cookies)
  if(req.isAuthenticated()) {
    next();
  } else if(req.cookies?.remember_me) {
    console.log(req.cookies.remember_me)
    const [token, hash] = req.cookies.remember_me.split('|');

    User.findOne({ token: token }).then(user => {
      if (user) {
        const verifyingHash = crypto.createHmac('sha256', APP_KEY)
          .update(user.id +'-'+ token)
          .digest('hex');

        if (hash === verifyingHash) {
          return req.login(user, () => {
            // セキュリティ的はここで remember_me を再度更新すべき
            next();
            return;
          });
        }
      }

      res.redirect(302, '/login');
    });
  } else {
    next();
  }
};

app.use(passport.initialize());

app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/board', authMiddleware, express.static(path.join(process.cwd(), 'public')));
app.use('/signup', express.static(path.join(process.cwd(), 'public')));
app.use('/login', express.static(path.join(process.cwd(), 'public')));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret" }));
app.use(passport.session());
app.use(cookieParser());

const APP_KEY = 'secret-key';

passport.use(new LocalStrategy(async (id, password, done) => {
  console.log(id, password)
  const findUserResult = await User.find({ login_id: id });
  // if (なんらかのエラー) {
  //   return done(エラー内容);
  // }
  if (findUserResult.length != 1) {
    return done(null, false);
  }
  const user = findUserResult[0];
  if (user.password == password) {
    return done(null, user);
  }
  return done(null, false);
}));

app.post('/login', passport.authenticate('local'),
  (req, res, next) => {
    if (!req.body.remember) {
      res.clearCookie('remember_me');
      next();
      return;
    }

    const user = (req as any).user as IUserDocument;
    const rememberToken = crypto.randomBytes(20).toString('hex');
    const hash = crypto.createHmac('sha256', APP_KEY).update(user.id +'-'+ rememberToken).digest('hex');

    user.token = rememberToken;
    user.save();

    res.cookie('id', user.id, {
      path: '/',
      maxAge: 30 * 60 * 1000 // 30分
    });
    res.cookie('remember_me', rememberToken +'|'+ hash, {
      path: '/',
      maxAge: 30 * 60 * 1000 // 30分
    });

    next()
  },
  (req, res) => {
    const user = (req as any).user as IUserDocument;
    console.log('/login request', user);
    res.redirect(`/profile?id=${user.id}`);
  }
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as IUserDocument);
});

app.post('/api/create', (req, res, next) => {
  console.log(req.body)
  const id = req.body.username;
  const pw = req.body.password;
  const pw2 = req.body.password2;
  console.log('POST /api/create', id, pw, pw2);
  if (!id) {
    return res.status(200).send({
      ok: false,
      code: CREATE_RESPONSE_ERROR.USERNAME_DOES_NOT_EXISTS,
      msg: {
        ja: 'IDが指定されていません',
        en: 'requested "userrname" does not exists.'
      }
    });
  }

  User.find({ login_id: id }).then(doc => {
    console.log(doc)
    if (doc.length > 0) {
      return res.status(200).send({
        ok: false,
        code: CREATE_RESPONSE_ERROR.USER_EXISTS,
        msg: {
          ja: '既に同じユーザーが存在しています',
          en: 'finded user.'
        }
      });
    }
    next();
    return;
  }).catch(err => {
    return res.status(500).send({
      ok: false,
      code: CREATE_RESPONSE_ERROR.TIMEOUT,
      msg: err
    });
  });
  return;
},
  async (req, res) => {
  const instance = new User();
  instance.login_id = req.body.username;
  instance.password = req.body.password;

  const obj = await (new Promise<{ err: any, id?: string }>((resolve, _) => {
    instance.save((err, doc) => {
      if (err) {
        resolve({ err });
      }
      resolve({ err: null, id: doc._id});
    })
  }));

  if (obj.err) {
    console.log('NG', obj.err)
    res.status(500).send({
      ok: false,
      code: CREATE_RESPONSE_ERROR.CREATE_FAILED,
      msg: {
        ja: '',
        en: 'user create failed.'
      }
    });
    return;
  }

  console.log('OK', obj.id)
  res.status(200).send({
    ok: true, id: obj.id,
    msg: {
      ja: '成功',
      en: 'user create success.'
    }
  });
  return;
});

app.post('/api/user', async (req, res) => {
  const body = req.body;
  console.log('POST /api/user', body)
  if (!body) {
    return res.status(500).send('error.');
  }

  return res.status(200).send('success.');
});

app.get('/api/user', (req, res) => {
  const id = req.query.id;
  console.log('GET /api/user', id, req.cookies)
  if (!id) {
    return res.status(500).send('error.');
  }

  return res.status(200).send({});
});

app.listen(PORT, () => {
  console.log(` ⚙️  ${env} app listening @ ${PORT} ⚙️ \n`);
  console.log(` --  launched @ ${Date()}  --`);
  console.log('-------------------------\n\n');
})
