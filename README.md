# PSK Golf League Manager

A comprehensive web application for managing the PSK Golf League's 6-week competitive golf season at Virginia Tech Campus Course.

## Features

### Player Management
- **User Authentication**: Each player creates a login and maintains persistent access throughout the 6-week season
- **User Registration**: Players can self-register with email for notifications
- **Email Notifications**: Receive updates on score submissions and deadlines
- **Buy-In Tracking**: Manage $20 buy-in payments per player

### Weekly Rounds
- **Round Declaration**: Players must declare their intent to play before teeing off
- **Hole-by-Hole Scoring**: Submit individual stroke counts for all 9 holes
- **Scorecard Photos**: Optional photo upload of scorecard for transparency
- **Score Locking**: Submissions are locked after deadline (Sunday 11:59 PM) to prevent edits

### Leaderboard & Standings

- **Weekly Standings**: Real-time leaderboard showing placements and scores for the active week.
- **Season Standings**: Cumulative totals across all weeks; displays total score and **Weeks Completed** (X/6).
- **Standings Visibility**: Weeks are only visible after a commissioner activates them.
- **Disqualification**: Players who miss 3 or more weeks are ineligible for season prizes (marked accordingly).

### Format & Rules

- **Season**: 6 weeks
- **Course**: Virginia Tech 9-hole campus course
- **Format**: Stroke play (9 holes)
- **Missed Round Penalty**: 63 strokes applied for missed weeks

### How to Use

1. Create an account (click **Create Account**).
2. Declare your round before playing (Declare Round tab).
3. Submit your scores after playing (Submit Scores tab) — all 9 holes are required.
4. View weekly and season standings on the Leaderboard.

### For Commissioners

1. **Start a Week**
   - Go to Admin Panel
   - Click "Start Week X" to enable player declarations

2. **Manage Buy-Ins**
   - View and update player payment status

3. **Edit Scores**
   - Correct any submission errors

## Technologies Used

- React 18
- TypeScript
- Zustand (State Management)
- Vite
- CSS3

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
