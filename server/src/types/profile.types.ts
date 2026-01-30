// types/user.types.ts

/**
 * User Flow:
 * 
 * 1. User signs up → User + StudentProfile created automatically
 * 2. User can learn, enroll in courses, track progress (everyone is a student)
 * 3. User clicks "Become an Instructor" → InstructorProfile created
 * 4. Now user can both learn AND teach (has both profiles)
 * 
 * Everyone is a student by default.
 * Instructor profile is optional and created on demand.
 */

// Remove the UserRole enum concept - everyone can be both!
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
  PENDING = 'PENDING',
}

export enum OAuthProvider {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
}

export interface OAuthAccount {
  id: string;
  provider: OAuthProvider;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface TwoFactorAuth {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  lastUsed?: Date;
}

// Everyone gets this automatically when they register
export interface StudentProfile {
  id: string;
  userId: string;
  interests: string[];
  
  // Stats
  coursesEnrolled: number;
  coursesCompleted: number;
  certificatesEarned: number;
  totalLearningTime: number; // in minutes
  currentStreak: number; // days learning consecutively
  longestStreak: number;
  
  // Learning preferences
  preferredLanguage: string;
  emailNotifications: boolean;
  courseRecommendations: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Created ONLY when user chooses to become an instructor
export interface InstructorProfile {
  id: string;
  userId: string;
  bio: string;
  expertise: string;
  yearsOfExperience: string; // '1-2', '3-5', '6-10', '10+'
  
  // Stats
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  totalReviews: number;
  totalEarnings: number;
  
  // Payout info
  stripeAccountId?: string; // Stripe Connect account
  paystackAccountId?: string; // Paystack subaccount
  payoutEnabled: boolean;
  
  // Social links
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  
  // Verification
  verified: boolean; // Platform verified instructor
  verifiedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  // Privacy
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  showEmail: boolean;
  showPhone: boolean;
  
  // Notifications
  emailDigest: boolean;
  marketingEmails: boolean;
  courseUpdates: boolean;
  newMessages: boolean;
  instructorUpdates: boolean; // Updates from instructors you follow
  
  // Learning
  autoplay: boolean;
  videoQuality: 'AUTO' | '720p' | '1080p';
  playbackSpeed: number;
  subtitles: boolean;
  
  // Timezone
  timezone: string;
}

export interface User {
  // Basic Info
  id: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  passwordHash: string;
  
  // Personal Details
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  
  // Profile
  avatar?: string;
  bio?: string; // General bio shown on profile
  status: AccountStatus;
  
  // Admin privileges (only for platform admins)
  isAdmin: boolean;
  
  // OAuth Accounts
  oauthAccounts: OAuthAccount[];
  
  // Security
  twoFactorAuth: TwoFactorAuth;
  lastLogin?: Date;
  lastPasswordChange?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Email Verification
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  
  // Student profile - ALWAYS exists (created at registration)
  studentProfile: StudentProfile;
  
  // Instructor profile - OPTIONAL (created when user chooses to teach)
  instructorProfile?: InstructorProfile;
  
  // Settings
  settings: UserSettings;
  
  // Payment & Subscription (for learning/student side)
  stripeCustomerId?: string; // For buying courses
  paystackCustomerId?: string;
  
  // Premium/Pro subscription (optional feature)
  isPremium: boolean;
  premiumExpiresAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Activity tracking
  lastActiveAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  
  // Feature flags
  betaFeatures: boolean;
  earlyAccess: boolean;
}

// ============================================
// Request/Response DTOs
// ============================================

// Registration - Creates user + studentProfile automatically
export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  
  // Optional: if they select interests during signup
  interests?: string[];
}

// Login
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponseDto {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Public user info (what other users see)
export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  
  // Show if they're an instructor
  isInstructor: boolean; // Has instructorProfile
  
  // Student info (everyone has this)
  studentProfile: {
    coursesCompleted: number;
    certificatesEarned: number;
  };
  
  // Instructor info (only if they're an instructor)
  instructorProfile?: {
    expertise: string;
    totalStudents: number;
    totalCourses: number;
    averageRating: number;
    verified: boolean;
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  createdAt: Date;
}

// Create instructor profile (when user wants to teach)
export interface CreateInstructorProfileDto {
  bio: string;
  expertise: string;
  yearsOfExperience: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
}

// Update instructor profile
export interface UpdateInstructorProfileDto {
  bio?: string;
  expertise?: string;
  yearsOfExperience?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
}

// Everyone can update their student profile (everyone has one by default)
export interface UpdateStudentProfileDto {
  interests?: string[];
  preferredLanguage?: string;
  emailNotifications?: boolean;
  courseRecommendations?: boolean;
}

// Profile updates (general)
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string; // General bio
}

// Settings updates
export interface UpdateSettingsDto {
  profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  showEmail?: boolean;
  showPhone?: boolean;
  emailDigest?: boolean;
  marketingEmails?: boolean;
  courseUpdates?: boolean;
  newMessages?: boolean;
  instructorUpdates?: boolean;
  autoplay?: boolean;
  videoQuality?: 'AUTO' | '720p' | '1080p';
  playbackSpeed?: number;
  subtitles?: boolean;
  timezone?: string;
}

// Password operations
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

// 2FA
export interface Enable2FADto {
  password: string;
}

export interface Verify2FADto {
  code: string;
}

export interface Disable2FADto {
  password: string;
  code: string;
}

// OAuth
export interface OAuthCallbackDto {
  provider: OAuthProvider;
  code: string;
  state: string;
}

// User dashboard stats
export interface UserDashboardStats {
  // Always show learning stats
  learningStats: {
    enrolledCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    certificatesEarned: number;
    totalLearningTime: number; // minutes
    currentStreak: number; // days
  };
  
  // Only if they're an instructor
  teachingStats?: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalStudents: number;
    totalRevenue: number;
    pendingPayout: number;
    averageRating: number;
    newEnrollmentsThisMonth: number;
    courseCompletionRate: number;
  };
}

// Helper to check user capabilities
export interface UserCapabilities {
  canEnrollInCourses: boolean; // Always true
  canCreateCourses: boolean; // True if has instructor profile
  canReceivePayments: boolean; // True if instructor profile + payout setup
  isAdmin: boolean;
  isPremium: boolean;
}

// ============================================
// Prisma Schema
// ============================================

export const PRISMA_USER_SCHEMA = `
model User {
  id                        String        @id @default(cuid())
  email                     String        @unique
  emailVerified             Boolean       @default(false)
  emailVerifiedAt           DateTime?
  passwordHash              String
  
  firstName                 String
  lastName                  String
  phoneNumber               String?
  phoneVerified             Boolean       @default(false)
  
  avatar                    String?
  bio                       String?       // General bio
  status                    AccountStatus @default(PENDING)
  
  // Admin flag (only for platform admins)
  isAdmin                   Boolean       @default(false)
  
  // Security
  twoFactorEnabled          Boolean       @default(false)
  twoFactorSecret           String?
  twoFactorBackupCodes      String[]
  lastLogin                 DateTime?
  lastPasswordChange        DateTime?
  passwordResetToken        String?
  passwordResetExpires      DateTime?
  emailVerificationToken    String?
  emailVerificationExpires  DateTime?
  
  // Payment (for buying courses)
  stripeCustomerId          String?
  paystackCustomerId        String?
  
  // Premium subscription (optional feature for platform)
  isPremium                 Boolean       @default(false)
  premiumExpiresAt          DateTime?
  
  // Metadata
  createdAt                 DateTime      @default(now())
  updatedAt                 DateTime      @updatedAt
  deletedAt                 DateTime?
  lastActiveAt              DateTime?
  ipAddress                 String?
  userAgent                 String?
  
  // Feature flags
  betaFeatures              Boolean       @default(false)
  earlyAccess               Boolean       @default(false)
  
  // Relations
  oauthAccounts             OAuthAccount[]
  instructorProfile         InstructorProfile?  // Optional: Created when user chooses to teach
  studentProfile            StudentProfile      // Always exists: Created at registration
  settings                  UserSettings?
  
  // As instructor
  coursesCreated            Course[]      @relation("InstructorCourses")
  
  // As student
  enrollments               Enrollment[]
  
  // Both
  payments                  Payment[]
  reviews                   Review[]
  
  @@index([email])
  @@index([status])
  @@index([isAdmin])
  @@map("users")
}

model OAuthAccount {
  id            String        @id @default(cuid())
  userId        String
  provider      OAuthProvider
  providerId    String
  accessToken   String?
  refreshToken  String?
  expiresAt     DateTime?
  createdAt     DateTime      @default(now())
  
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerId])
  @@index([userId])
  @@map("oauth_accounts")
}

// Only created when user chooses to become an instructor (optional)
model InstructorProfile {
  id                  String    @id @default(cuid())
  userId              String    @unique
  bio                 String
  expertise           String
  yearsOfExperience   String
  
  // Stats
  totalStudents       Int       @default(0)
  totalCourses        Int       @default(0)
  averageRating       Float     @default(0)
  totalReviews        Int       @default(0)
  totalEarnings       Float     @default(0)
  
  // Payout
  stripeAccountId     String?
  paystackAccountId   String?
  payoutEnabled       Boolean   @default(false)
  
  // Social
  website             String?
  twitter             String?
  linkedin            String?
  github              String?
  
  // Verification
  verified            Boolean   @default(false)
  verifiedAt          DateTime?
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("instructor_profiles")
}

// Always created at registration - everyone is a student by default
model StudentProfile {
  id                      String   @id @default(cuid())
  userId                  String   @unique
  interests               String[]
  
  // Stats
  coursesEnrolled         Int      @default(0)
  coursesCompleted        Int      @default(0)
  certificatesEarned      Int      @default(0)
  totalLearningTime       Int      @default(0) // minutes
  currentStreak           Int      @default(0) // days
  longestStreak           Int      @default(0) // days
  
  // Preferences
  preferredLanguage       String   @default("en")
  emailNotifications      Boolean  @default(true)
  courseRecommendations   Boolean  @default(true)
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  user                    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("student_profiles")
}

model UserSettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  
  // Privacy
  profileVisibility     String   @default("PUBLIC")
  showEmail             Boolean  @default(false)
  showPhone             Boolean  @default(false)
  
  // Notifications
  emailDigest           Boolean  @default(true)
  marketingEmails       Boolean  @default(true)
  courseUpdates         Boolean  @default(true)
  newMessages           Boolean  @default(true)
  instructorUpdates     Boolean  @default(true)
  
  // Learning
  autoplay              Boolean  @default(true)
  videoQuality          String   @default("AUTO")
  playbackSpeed         Float    @default(1.0)
  subtitles             Boolean  @default(false)
  
  // Timezone
  timezone              String   @default("UTC")
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_settings")
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  DELETED
  PENDING
}

enum OAuthProvider {
  GOOGLE
  GITHUB
}
`;

// ============================================
// Helper Functions
// ============================================

// Check if user is an instructor
export function isInstructor(user: User): boolean {
  return user.instructorProfile !== undefined && user.instructorProfile !== null;
}

// Everyone is a student by default
export function isStudent(user: User): boolean {
  return true; // studentProfile always exists
}

// Get user capabilities
export function getUserCapabilities(user: User): UserCapabilities {
  return {
    canEnrollInCourses: true, // Everyone can learn (everyone is a student)
    canCreateCourses: isInstructor(user),
    canReceivePayments: isInstructor(user) && user.instructorProfile!.payoutEnabled,
    isAdmin: user.isAdmin,
    isPremium: user.isPremium,
  };
}

// Get user display name
export function getUserDisplayName(user: User): string {
  return `\${user.firstName} \${user.lastName}\`;
}

// Get user roles as array (for UI)
export function getUserRoles(user: User): string[] {
  const roles: string[] = ['Student']; // Everyone is a student
  
  if (isInstructor(user)) roles.push('Instructor');
  if (user.isAdmin) roles.push('Admin');
  
  return roles;
}

// ============================================
// Example Usage
// ============================================

/*
// When user registers
const newUser = await createUser({
  email: 'john@example.com',
  password: 'hash...',
  // ... other fields
});
// newUser.studentProfile is automatically created ✅
// newUser.instructorProfile is null ❌

// User can now:
// ✅ Enroll in courses
// ✅ Track learning progress
// ❌ Create courses (not an instructor yet)

// Later, user wants to teach
const instructorProfile = await createInstructorProfile(newUser.id, {
  bio: 'Expert web developer',
  expertise: 'Web Development',
  yearsOfExperience: '5-10',
});
// Now user has BOTH profiles ✅

// User can now:
// ✅ Enroll in courses (still a student)
// ✅ Create and sell courses (now an instructor)
// ✅ Earn money from teaching
// ✅ Spend money on learning
*/

export default User;