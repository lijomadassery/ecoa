# CAMU ECOA App - Product Requirements Document

## 1. Executive Summary

The CAMU ECOA (Effective Communication for Armstrong) App is designed to digitize and streamline the process of notifying Hard of Hearing (HOH) incarcerated persons of important announcements and activities within correctional facilities. This solution will help the California Department of Corrections and Rehabilitation (CDCR) demonstrate compliance with the Armstrong lawsuit requirements by creating an auditable record of communication prompts delivered to HOH individuals.

The app will be primarily used by Correctional Officers to record when they have delivered prompts to HOH individuals, capturing electronic signatures as proof of notification. It will include offline functionality to accommodate limited WiFi access in institutions while providing real-time data synchronization when connectivity is available.

## 2. Problem Statement

HOH incarcerated persons are required to be individually notified of announcements and activities that other individuals might hear through general housing unit announcements. Currently, this process is manual, inconsistent, and lacks proper documentation. The Department faces legal challenges related to the Armstrong lawsuit due to insufficient proof that HOH individuals are receiving required communication prompts.

Key problems this app will solve:
- Lack of consistent notification process for HOH individuals
- Insufficient documentation of prompt delivery
- Limited visibility into compliance rates
- Manual, paper-based processes that are difficult to track and report
- Building officers don't always know who requires these communications

## 3. Target Users

### Primary Users (80%)
- Housing Unit Officers / Correctional Officers (COs)
  - Need to quickly identify HOH individuals in their units
  - Need to document prompt delivery efficiently
  - Must collect signatures from individuals who received prompts
  - Must be able to work in offline environments

### Secondary Users (20%)
- Incarcerated Person helpers (not permitted to use Custody tablets)
- Medical Staff (Mental Health and Nursing)
- Sergeants & Lieutenants (supervisory roles)
- Teachers (for educational settings)
- Work supervisors (for work settings)

## 4. Key Features & Requirements

### 4.1 User Authentication
- Single sign-on integration with existing CDCR systems
- Role-based access controls
- Secure login process appropriate for custody environment

### 4.2 Roster Management
- Digital roster view of all HOH individuals in each housing unit
- Ability to filter and sort by location, name, and CDCR number
- Visual indicators for individuals who require specific communication types
- Automatic synchronization with central database when online

### 4.3 Prompt Management
- Pre-defined list of communication prompts/activities as specified by CAMU/CDCR
- Ability to select multiple individuals for the same prompt
- Custom prompt creation for situational needs
- Categorization of prompts by type (yard time, meals, medical, etc.)

### 4.4 Documentation & Signature Capture
- Electronic signature capture from HOH individuals
- Options to document "attempt made" or "refused to sign"
- Automatic capture of officer's name, timestamp, location, and prompt details
- Ability to add notes or comments when necessary
- Photo capture capability for additional documentation if needed

### 4.5 Offline Functionality
- Full functionality in offline mode
- Automatic data synchronization when connection is restored
- Local storage of recent roster information and pending submissions
- Visual indicators for unsynchronized data

### 4.6 Reporting Dashboard
- Real-time compliance monitoring dashboard
- Executive reporting for statewide observability
- Metrics tracking for daily and weekly progress
- Report generation by facility, housing unit, or individual

### 4.7 System Integration
- Integration with existing CDCR systems for inmate data
- Part of the broader officer portal initiative
- Potential integration with CCHCS systems for expanded WiFi coverage

## 5. User Flows

### 5.1 Officer Login & Roster View
1. Officer logs into the app using credentials
2. System identifies officer's assigned location
3. Officer views roster of HOH individuals in their housing unit
4. System displays individuals requiring communication assistance

### 5.2 Delivering a Prompt
1. Officer selects individuals to receive prompt
2. Officer selects prompt type from pre-defined list
3. System automatically records officer name, time, date, and location
4. Officer approaches individuals to deliver prompt and collects signature
5. Officer records outcome (signed, attempt made, refused)
6. Data is saved locally until synchronized with central system

### 5.3 Reviewing Compliance
1. Supervisor logs into dashboard
2. Views compliance metrics by facility, housing unit, or individual
3. Identifies areas requiring additional attention
4. Generates reports for compliance documentation

## 6. Non-Functional Requirements

### 6.1 Performance
- App must function efficiently on institutional tablets
- Synchronization must complete within 60 seconds when connection is available
- App must support at least 100 concurrent users per facility

### 6.2 Security
- All data must be encrypted at rest and in transit
- Authentication must comply with CDCR security standards
- No sensitive information should be permanently stored on local devices

### 6.3 Reliability
- App must function reliably in offline mode for up to 72 hours
- Data integrity must be maintained during synchronization
- Automated backup and recovery mechanisms

### 6.4 Usability
- Interface must be intuitive enough to require minimal training
- Operations should require minimal typing and rely on selection when possible
- App should function efficiently in high-stress, time-constrained environments
- Clear visual indicators for system status (online/offline, synced/unsynced)

### 6.5 Compatibility
- Must work on CDCR-approved tablets
- Must function on limited bandwidth WiFi networks
- Consider compatibility with CCHCS WiFi networks

## 7. Success Metrics

### 7.1 Compliance Metrics
- 100% documentation of required prompts
- Reduction in compliance-related incidents
- Improved audit outcomes related to Armstrong lawsuit requirements

### 7.2 Usage Metrics
- Adoption rate among officers
- Time saved compared to previous manual processes
- Reduced paperwork and administrative burden

### 7.3 System Performance
- Synchronization success rate
- System uptime and reliability
- User satisfaction ratings

## 8. Implementation Timeline

### Phase 1 (Months 1-2)
- Development of authentication and user management
- Basic roster view functionality
- Initial offline capabilities

### Phase 2 (Months 3-4)
- Prompt management system
- Signature capture functionality
- Enhanced offline mode with synchronization

### Phase 3 (Months 5-6)
- Reporting dashboard development
- Integration with broader officer portal
- System optimization and performance improvements

## 9. Risks & Mitigation Strategies

### 9.1 Technical Risks
- **Limited WiFi coverage**: Implement robust offline functionality with clear sync status indicators
- **Integration challenges**: Early engagement with IT teams managing existing systems
- **Device limitations**: Perform testing on actual devices used in facilities

### 9.2 Operational Risks
- **User adoption**: Develop intuitive interface and comprehensive training materials
- **Process changes**: Work with facility leadership to develop change management plan
- **Data accuracy**: Implement validation checks and regular audit processes

### 9.3 Timeline Risks
- **Integration delays**: Build modular system that can function independently if needed
- **Approval processes**: Early engagement with all stakeholders for requirements validation
- **Scope expansion**: Maintain strict focus on core functionality for initial release

## 10. Appendix

### 10.1 Glossary
- **CAMU**: Correctional Accessibility Management Unit
- **CDCR**: California Department of Corrections and Rehabilitation
- **ECOA**: Effective Communication for Armstrong
- **HOH**: Hard of Hearing
- **OACC**: Office of Audits and Court Compliance
- **DAI**: Division of Adult Institutions
- **CCHCS**: California Correctional Health Care Services

### 10.2 Reference Documents
- Armstrong lawsuit requirements
- Current manual notification processes
- CDCR technology standards
- Tablet specifications for correctional environments
