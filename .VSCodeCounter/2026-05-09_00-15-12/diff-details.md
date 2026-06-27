# Diff Details

Date : 2026-05-09 00:15:12

Directory c:\\Users\\ikapa\\OneDrive\\Desktop\\cardioGuard\\backend

Total : 75 files,  -4440 codes, -66 comments, -312 blanks, all -4818 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/package-lock.json](/backend/package-lock.json) | JSON | 2,062 | 0 | 1 | 2,063 |
| [backend/package.json](/backend/package.json) | JSON | 29 | 0 | 1 | 30 |
| [backend/scripts/dbInit.js](/backend/scripts/dbInit.js) | JavaScript | 14 | 0 | 4 | 18 |
| [backend/scripts/tablesInit.js](/backend/scripts/tablesInit.js) | JavaScript | 94 | 0 | 9 | 103 |
| [backend/src/addAdmin.js](/backend/src/addAdmin.js) | JavaScript | 9 | 0 | 2 | 11 |
| [backend/src/addHospital.js](/backend/src/addHospital.js) | JavaScript | 12 | 0 | 1 | 13 |
| [backend/src/app.js](/backend/src/app.js) | JavaScript | 79 | 9 | 24 | 112 |
| [backend/src/config/db.js](/backend/src/config/db.js) | JavaScript | 15 | 1 | 6 | 22 |
| [backend/src/controllers/adminController.js](/backend/src/controllers/adminController.js) | JavaScript | 92 | 0 | 9 | 101 |
| [backend/src/controllers/alertController.js](/backend/src/controllers/alertController.js) | JavaScript | 23 | 0 | 5 | 28 |
| [backend/src/controllers/authController.js](/backend/src/controllers/authController.js) | JavaScript | 75 | 6 | 20 | 101 |
| [backend/src/controllers/hospitalController.js](/backend/src/controllers/hospitalController.js) | JavaScript | 229 | 24 | 54 | 307 |
| [backend/src/controllers/otpController.js](/backend/src/controllers/otpController.js) | JavaScript | 124 | 1 | 26 | 151 |
| [backend/src/middleware/authMiddleware.js](/backend/src/middleware/authMiddleware.js) | JavaScript | 26 | 0 | 10 | 36 |
| [backend/src/queue/vitalsQueue.js](/backend/src/queue/vitalsQueue.js) | JavaScript | 11 | 0 | 2 | 13 |
| [backend/src/routes/adminRoutes.js](/backend/src/routes/adminRoutes.js) | JavaScript | 15 | 0 | 1 | 16 |
| [backend/src/routes/alertRoutes.js](/backend/src/routes/alertRoutes.js) | JavaScript | 6 | 1 | 3 | 10 |
| [backend/src/routes/authRoutes.js](/backend/src/routes/authRoutes.js) | JavaScript | 6 | 0 | 3 | 9 |
| [backend/src/routes/hospitalRoutes.js](/backend/src/routes/hospitalRoutes.js) | JavaScript | 8 | 1 | 2 | 11 |
| [backend/src/routes/otpRoutes.js](/backend/src/routes/otpRoutes.js) | JavaScript | 7 | 0 | 0 | 7 |
| [backend/src/services/alertDbService.js](/backend/src/services/alertDbService.js) | JavaScript | 15 | 0 | 2 | 17 |
| [backend/src/services/hospitalAlertService.js](/backend/src/services/hospitalAlertService.js) | JavaScript | 40 | 3 | 9 | 52 |
| [backend/src/services/hospitalService.js](/backend/src/services/hospitalService.js) | JavaScript | 46 | 1 | 9 | 56 |
| [backend/src/services/notificationService.js](/backend/src/services/notificationService.js) | JavaScript | 97 | 11 | 17 | 125 |
| [backend/src/services/userService.js](/backend/src/services/userService.js) | JavaScript | 19 | 2 | 6 | 27 |
| [backend/src/sockets/socketHandler.js](/backend/src/sockets/socketHandler.js) | JavaScript | 35 | 7 | 12 | 54 |
| [backend/src/testSocket.js](/backend/src/testSocket.js) | JavaScript | 22 | 0 | 8 | 30 |
| [backend/src/workers/vitalsWorker.js](/backend/src/workers/vitalsWorker.js) | JavaScript | 138 | 4 | 32 | 174 |
| [frontend/README.md](/frontend/README.md) | Markdown | -12 | 0 | -7 | -19 |
| [frontend/eslint.config.js](/frontend/eslint.config.js) | JavaScript | -28 | 0 | -2 | -30 |
| [frontend/index.html](/frontend/index.html) | HTML | -13 | 0 | 0 | -13 |
| [frontend/package-lock.json](/frontend/package-lock.json) | JSON | -3,617 | 0 | -1 | -3,618 |
| [frontend/package.json](/frontend/package.json) | JSON | -33 | 0 | -1 | -34 |
| [frontend/public/favicon.svg](/frontend/public/favicon.svg) | XML | -1 | 0 | 0 | -1 |
| [frontend/public/icons.svg](/frontend/public/icons.svg) | XML | -24 | 0 | -1 | -25 |
| [frontend/src/App.jsx](/frontend/src/App.jsx) | JavaScript JSX | -67 | -5 | -11 | -83 |
| [frontend/src/assets/react.svg](/frontend/src/assets/react.svg) | XML | -1 | 0 | 0 | -1 |
| [frontend/src/assets/vite.svg](/frontend/src/assets/vite.svg) | XML | -1 | 0 | -1 | -2 |
| [frontend/src/components/AdminProtectedRoute.jsx](/frontend/src/components/AdminProtectedRoute.jsx) | JavaScript JSX | -8 | -2 | -3 | -13 |
| [frontend/src/components/CircularProgress.css](/frontend/src/components/CircularProgress.css) | PostCSS | -26 | 0 | -4 | -30 |
| [frontend/src/components/CircularProgress.jsx](/frontend/src/components/CircularProgress.jsx) | JavaScript JSX | -38 | 0 | -4 | -42 |
| [frontend/src/components/HospitalProtectedRoute.jsx](/frontend/src/components/HospitalProtectedRoute.jsx) | JavaScript JSX | -8 | 0 | -3 | -11 |
| [frontend/src/components/MiniFatigueGraph.css](/frontend/src/components/MiniFatigueGraph.css) | PostCSS | -43 | -1 | -5 | -49 |
| [frontend/src/components/MiniFatigueGraph.jsx](/frontend/src/components/MiniFatigueGraph.jsx) | JavaScript JSX | -27 | 0 | -1 | -28 |
| [frontend/src/components/Navbar.css](/frontend/src/components/Navbar.css) | PostCSS | -115 | -1 | -16 | -132 |
| [frontend/src/components/Navbar.jsx](/frontend/src/components/Navbar.jsx) | JavaScript JSX | -139 | -11 | -20 | -170 |
| [frontend/src/components/ProtectedRoute.jsx](/frontend/src/components/ProtectedRoute.jsx) | JavaScript JSX | -8 | -2 | -3 | -13 |
| [frontend/src/components/TelemetryLog.css](/frontend/src/components/TelemetryLog.css) | PostCSS | -45 | 0 | -7 | -52 |
| [frontend/src/components/TelemetryLog.jsx](/frontend/src/components/TelemetryLog.jsx) | JavaScript JSX | -32 | 0 | -4 | -36 |
| [frontend/src/components/VitalsPod.css](/frontend/src/components/VitalsPod.css) | PostCSS | -25 | 0 | -3 | -28 |
| [frontend/src/components/VitalsPod.jsx](/frontend/src/components/VitalsPod.jsx) | JavaScript JSX | -30 | 0 | -3 | -33 |
| [frontend/src/context/SimulationContext.jsx](/frontend/src/context/SimulationContext.jsx) | JavaScript JSX | -255 | -33 | -57 | -345 |
| [frontend/src/context/ThemeContext.jsx](/frontend/src/context/ThemeContext.jsx) | JavaScript JSX | -13 | 0 | -4 | -17 |
| [frontend/src/index.css](/frontend/src/index.css) | PostCSS | -124 | -3 | -18 | -145 |
| [frontend/src/main.jsx](/frontend/src/main.jsx) | JavaScript JSX | -9 | 0 | -1 | -10 |
| [frontend/src/pages/AdminAuth.css](/frontend/src/pages/AdminAuth.css) | PostCSS | -133 | -2 | -21 | -156 |
| [frontend/src/pages/AdminAuth.jsx](/frontend/src/pages/AdminAuth.jsx) | JavaScript JSX | -63 | 0 | -8 | -71 |
| [frontend/src/pages/AdminDashboard.css](/frontend/src/pages/AdminDashboard.css) | PostCSS | -273 | -11 | -48 | -332 |
| [frontend/src/pages/AdminDashboard.jsx](/frontend/src/pages/AdminDashboard.jsx) | JavaScript JSX | -110 | -2 | -7 | -119 |
| [frontend/src/pages/Auth.css](/frontend/src/pages/Auth.css) | PostCSS | -329 | -3 | -48 | -380 |
| [frontend/src/pages/Auth.jsx](/frontend/src/pages/Auth.jsx) | JavaScript JSX | -194 | -4 | -21 | -219 |
| [frontend/src/pages/DashboardPage.css](/frontend/src/pages/DashboardPage.css) | PostCSS | -30 | -2 | -5 | -37 |
| [frontend/src/pages/DashboardPage.jsx](/frontend/src/pages/DashboardPage.jsx) | JavaScript JSX | -289 | -1 | -12 | -302 |
| [frontend/src/pages/ForgotPassword.css](/frontend/src/pages/ForgotPassword.css) | PostCSS | -82 | -5 | -13 | -100 |
| [frontend/src/pages/ForgotPassword.jsx](/frontend/src/pages/ForgotPassword.jsx) | JavaScript JSX | -148 | -7 | -11 | -166 |
| [frontend/src/pages/HospitalAuth.css](/frontend/src/pages/HospitalAuth.css) | PostCSS | -254 | -2 | -39 | -295 |
| [frontend/src/pages/HospitalAuth.jsx](/frontend/src/pages/HospitalAuth.jsx) | JavaScript JSX | -164 | -6 | -25 | -195 |
| [frontend/src/pages/HospitalDashboard.css](/frontend/src/pages/HospitalDashboard.css) | PostCSS | -262 | -7 | -41 | -310 |
| [frontend/src/pages/HospitalDashboard.jsx](/frontend/src/pages/HospitalDashboard.jsx) | JavaScript JSX | -108 | -8 | -19 | -135 |
| [frontend/src/pages/RoleSelection.css](/frontend/src/pages/RoleSelection.css) | PostCSS | -260 | -7 | -46 | -313 |
| [frontend/src/pages/RoleSelection.jsx](/frontend/src/pages/RoleSelection.jsx) | JavaScript JSX | -52 | -3 | -6 | -61 |
| [frontend/src/pages/SimulationPage.css](/frontend/src/pages/SimulationPage.css) | PostCSS | -80 | -1 | -12 | -93 |
| [frontend/src/pages/SimulationPage.jsx](/frontend/src/pages/SimulationPage.jsx) | JavaScript JSX | -202 | -7 | -26 | -235 |
| [frontend/vercel.json](/frontend/vercel.json) | JSON | -8 | 0 | 0 | -8 |
| [frontend/vite.config.js](/frontend/vite.config.js) | JavaScript | -5 | -1 | -2 | -8 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details