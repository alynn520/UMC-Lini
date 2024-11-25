import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerAutogen from "swagger-autogen";
import swaggerUiExpress from "swagger-ui-express";
import {
  handleUserSignUp,
  handleUserReviews,
} from "./controllers/user.controller.js";
import { handleUserMissions } from "./controllers/mission.controller.js";
import {
  handleMissionChallengeSignUp,
  handleOngoingMissions,
} from "./controllers/mission_challenge.controller.js";
import { handleReviewSignUp } from "./controllers/review.controller.js";
// 9주차 추가
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import session from "express-session";
import passport from "passport";
import { googleStrategy, naverStrategy } from "./auth.config.js";
import { prisma } from "./db.config.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

// 공통 응답을 사용할 수 있는 헬퍼 함수 등록
app.use((req, res, next) => {
  res.success = (success) => {
    return res.json({ resultType: "SUCCESS", error: null, success });
  };

  res.error = ({ errorCode = "unknown", reason = null, data = null }) => {
    return res.json({
      resultType: "FAIL",
      error: { errorCode, reason, data },
      success: null,
    });
  };

  next();
});

app.use(cors()); // cors 방식 허용
app.use(express.static("public")); // 정적 파일 접근
app.use(express.json()); // request의 본문을 json으로 해석할 수 있도록 함 (JSON 형태의 요청 body를 파싱하기 위함)
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석

// 9주차 실습 추가 내용
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
      secure: process.env.NODE_ENV === "production", // 프로덕션에서는 true
      httpOnly: true, // 클라이언트에서 쿠키 접근 차단
    },
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

passport.use(googleStrategy);
passport.use(naverStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

// google 로그인 할 수 있는 경로 만들기
app.get("/oauth2/login/google", passport.authenticate("google"));
app.get(
  "/oauth2/callback/google",
  passport.authenticate("google", {
    failureRedirect: "/oauth2/login/google",
    failureMessage: true,
  }),
  (req, res) => res.redirect("/")
);

// naver 로그인 할 수 있는 경로 만들기
app.get("/auth/naver", passport.authenticate("naver"));
app.get(
  "/auth/naver/callback",
  (req, res, next) => {
    console.log("Auth Code:", req.query.code);
    next();
  },
  passport.authenticate("naver", { failureRedirect: "/auth/naver" }),
  (req, res) => res.redirect("/")
);

app.use(
  "/docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(
    {},
    {
      swaggerOptions: {
        url: "/openapi.json",
      },
    }
  )
);

app.get("/openapi.json", async (req, res, next) => {
  // #swagger.ignore = true
  const options = {
    openapi: "3.0.0",
    disableLogs: true,
    writeOutputFile: false,
  };
  const outputFile = "/dev/null"; // 파일 출력은 사용하지 않습니다.
  const routes = ["./src/index.js"];
  const doc = {
    info: {
      title: "UMC 7th",
      description: "UMC 7th Node.js 테스트 프로젝트입니다.",
    },
    host: "localhost:3000",
  };

  const result = await swaggerAutogen(options)(outputFile, routes, doc);
  res.json(result ? result.data : null);
});

// user API
app.post("/api/v1/users/signup", handleUserSignUp);

// 전역 오류를 처리하기 위한 미들웨어
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).error({
    errorCode: err.errorCode || "unknown",
    reason: err.reason || err.message || null,
    data: err.data || null,
  });
});

// 리뷰 등록 API
app.post("/api/v1/reviews", handleReviewSignUp);

// 미션 도전 API
app.post("/api/v1/missions/challenge", handleMissionChallengeSignUp);

// 리뷰 목록 API
app.get("/api/v1/stores/:storeId/reviews", handleUserReviews);

// 미션 목록 API
app.get("/api/v1/users/:userId/missions", handleUserMissions);

// 진행 중인 미션 목록 API
app.get("/api/v1/users/:userId/ongoing-missions", handleOngoingMissions);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/", (req, res) => {
  // #swagger.ignore = true
  console.log(req.user);
  res.send("Hello World!");
});
