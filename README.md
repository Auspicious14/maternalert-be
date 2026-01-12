# Maternal Health Support Backend

⚠️ **CLINICAL SAFETY NOTICE**

This application is a **CARE-SUPPORT and ESCALATION TOOL**.

- ❌ This is **NOT** a diagnostic system
- ❌ This is **NOT** a medical device
- ✅ This **IS** a care-support and escalation tool for early warning awareness

## Purpose

This backend supports a maternal health application focused on:
- Early warning awareness for high blood pressure disorders in pregnancy
- Care escalation based on objective measurements
- Educational content delivery
- Connection to healthcare providers

## Non-Diagnostic Design Principles

This system is built with strict clinical safety constraints:

1. **No Diagnosis**: The system never diagnoses conditions
2. **No Medical Advice**: No treatment recommendations or medical guidance
3. **No Risk Scoring**: No probability calculations or risk percentages
4. **Data Minimization**: Only essential data is collected
5. **Escalation Bias**: When uncertain, always escalate to higher priority
6. **Template-Only Messaging**: No dynamic medical text generation

## Architecture

### Modular Domain-Driven Design

```
src/
├── auth/                 # Authentication (minimal PII)
├── user-profile/         # User profile (data minimization)
├── blood-pressure/       # BP readings (neutral storage)
├── symptoms/             # Symptom tracking (atomic, non-scored)
├── care-priority/        # Care priority engine (rule-based)
├── notifications/        # Alerts (template-only)
└── education/            # Educational content
```

### Technology Stack

- **Framework**: NestJS with TypeScript (strict mode)
- **Database**: PostgreSQL (to be configured in STEP 2)
- **Authentication**: JWT-based
- **Validation**: class-validator with strict settings

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# (Database credentials, JWT secrets, etc.)
```

### Development

```bash
# Start in development mode with hot reload
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:cov
```

## Implementation Status

This project follows a 12-step implementation process:

### Phase 1: Foundation
- [x] **STEP 1**: Project Bootstrap & Architecture ✅
- [ ] **STEP 2**: Database & ORM Setup
- [ ] **STEP 3**: Authentication Module

### Phase 2: Core Data Modules
- [ ] **STEP 4**: User Profile Module (Data Minimization)
- [ ] **STEP 5**: Blood Pressure Module (Neutral Handling)
- [ ] **STEP 6**: Symptom Module (Atomic, Non-Scored)

### Phase 3: Care Logic & Safety
- [ ] **STEP 7**: Care Priority Engine (Most Critical)
- [ ] **STEP 8**: Care Priority API Endpoint
- [ ] **STEP 9**: Notifications & Alerts

### Phase 4: Support & Security
- [ ] **STEP 10**: Education Content Module
- [ ] **STEP 11**: Security, Logging & Rate Limiting
- [ ] **STEP 12**: Final Safety Audit

## API Documentation

Once running, API documentation will be available at:
- Development: `http://localhost:3000/api/v1`
- Swagger docs: (to be added in later steps)

## Clinical Safety Commitments

Every module in this system adheres to:

1. **Deterministic Logic**: No AI/ML for medical decisions
2. **Transparent Rules**: All escalation rules are documented
3. **Conservative Defaults**: Favor care-seeking when uncertain
4. **Audit Trail**: All decisions are logged (without PII)
5. **No Diagnostic Language**: Careful wording throughout

## Regulatory Considerations

This system is designed for:
- NGO deployments
- Public health pilots
- Clinical partnerships
- Research studies

**Not intended for**:
- Direct-to-consumer medical diagnosis
- Replacement of clinical judgment
- Unsupervised medical decision-making

## License

ISC

## Support

For questions about clinical safety design or implementation, please review the inline documentation in each module.

---

**Remember**: This is a care-support tool. Always encourage users to seek professional medical advice.
