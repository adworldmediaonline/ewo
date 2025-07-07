'use client';
import { useUpdateProfileMutation } from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import ErrorMsg from '../common/error-msg';
import styles from './profile-info.module.css';

// SVG Icons
const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polyline
      points="20,6 9,17 4,12"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

// Simplified validation schema
const schema = Yup.object().shape({
  name: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phone: Yup.string()
    .required('Phone number is required')
    .min(10, 'Phone number must be at least 10 digits'),
  address: Yup.string()
    .required('Address is required')
    .min(5, 'Please enter a complete address'),
  bio: Yup.string().min(10, 'Bio must be at least 10 characters'),
});

export default function ProfileInfo() {
  const { user } = useSelector(state => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
    },
  });

  const watchedValues = watch();

  const onSubmit = data => {
    updateProfile({
      id: user?._id,
      ...data,
    }).then(result => {
      if (result?.error) {
        notifyError(result?.error?.data?.message || 'Failed to update profile');
      } else {
        notifySuccess('Profile updated successfully!');
      }
    });
  };

  const getCompletionPercentage = () => {
    const requiredFields = ['name', 'email', 'phone', 'address'];
    const optionalFields = ['bio'];

    const requiredFilled = requiredFields.filter(
      field => watchedValues[field] && watchedValues[field].trim()
    ).length;

    const optionalFilled = optionalFields.filter(
      field => watchedValues[field] && watchedValues[field].trim()
    ).length;

    const requiredPercentage = (requiredFilled / requiredFields.length) * 70;
    const optionalPercentage = (optionalFilled / optionalFields.length) * 30;

    return Math.round(requiredPercentage + optionalPercentage);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className={styles.profileInfoContainer}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileHeaderContent}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className={styles.headerInfo}>
              <h2 className={styles.profileTitle}>Profile Information</h2>
              <p className={styles.profileSubtitle}>
                Update your personal details and contact information
              </p>
            </div>
          </div>

          <div className={styles.completionSection}>
            <div className={styles.completionText}>
              <span className={styles.completionLabel}>Profile Completion</span>
              <span className={styles.completionValue}>
                {completionPercentage}%
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Single Form */}
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.profileForm}>
          {/* Basic Information Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Full Name <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    className={`${styles.formInput} ${
                      errors.name ? styles.inputError : ''
                    } ${
                      watchedValues.name && !errors.name
                        ? styles.inputSuccess
                        : ''
                    }`}
                    placeholder="Enter your full name"
                    {...register('name')}
                  />
                  {watchedValues.name && !errors.name && (
                    <CheckIcon className={styles.successIcon} />
                  )}
                </div>
                {errors.name && <ErrorMsg msg={errors.name.message} />}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Email Address <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    className={`${styles.formInput} ${
                      errors.email ? styles.inputError : ''
                    } ${
                      watchedValues.email && !errors.email
                        ? styles.inputSuccess
                        : ''
                    }`}
                    placeholder="Enter your email"
                    {...register('email')}
                  />
                  {watchedValues.email && !errors.email && (
                    <CheckIcon className={styles.successIcon} />
                  )}
                </div>
                {errors.email && <ErrorMsg msg={errors.email.message} />}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Phone Number <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <input
                    type="tel"
                    className={`${styles.formInput} ${
                      errors.phone ? styles.inputError : ''
                    } ${
                      watchedValues.phone && !errors.phone
                        ? styles.inputSuccess
                        : ''
                    }`}
                    placeholder="Enter your phone number"
                    {...register('phone')}
                  />
                  {watchedValues.phone && !errors.phone && (
                    <CheckIcon className={styles.successIcon} />
                  )}
                </div>
                {errors.phone && <ErrorMsg msg={errors.phone.message} />}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Bio <span className={styles.optional}>(Optional)</span>
                </label>
                <div className={styles.inputGroup}>
                  <textarea
                    className={`${styles.formTextarea} ${
                      errors.bio ? styles.inputError : ''
                    } ${
                      watchedValues.bio && !errors.bio
                        ? styles.inputSuccess
                        : ''
                    }`}
                    placeholder="Tell us about yourself"
                    rows="3"
                    {...register('bio')}
                  />
                  {watchedValues.bio && !errors.bio && (
                    <CheckIcon className={styles.successIcon} />
                  )}
                </div>
                {errors.bio && <ErrorMsg msg={errors.bio.message} />}
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Address Information</h3>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.formLabel}>
                  Address <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    className={`${styles.formInput} ${
                      errors.address ? styles.inputError : ''
                    } ${
                      watchedValues.address && !errors.address
                        ? styles.inputSuccess
                        : ''
                    }`}
                    placeholder="Enter your full address"
                    {...register('address')}
                  />
                  {watchedValues.address && !errors.address && (
                    <CheckIcon className={styles.successIcon} />
                  )}
                </div>
                {errors.address && <ErrorMsg msg={errors.address.message} />}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.submitButton} ${
                isLoading ? styles.loading : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
