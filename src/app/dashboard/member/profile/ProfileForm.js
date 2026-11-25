'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/lib/actions/artwork.actions';
import ImageUpload from '@/components/ui/ImageUpload';
import UserAvatar from '@/components/ui/UserAvatar';
import { canUseProfileImage, resolveUserAvatarSrc } from '@/lib/avatar';

export default function ProfileForm({ user }) {
  const router = useRouter();
  const allowProfilePhoto = canUseProfileImage(user?.role);
  const [profileImage, setProfileImage] = useState(
    allowProfilePhoto ? resolveUserAvatarSrc(user) || '' : ''
  );
  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await updateProfile(prevState, formData);
    if (res?.success) {
      setProfileImage(allowProfilePhoto ? res.profileImage || '' : '');
      router.refresh();
    }
    return res;
  }, null);

  return (
    <div className="member-form-panel member-profile-panel">
      <div className="profile-identity-preview">
        <div className="profile-identity-lead">
          <UserAvatar src={profileImage} role={user.role} name={user.name} size={56} />
          <div className="profile-identity-meta">
            <span className="profile-identity-name">{user.name}</span>
            <span className="profile-identity-hint">
              {!allowProfilePhoto
                ? 'Default role avatar is used for this account'
                : profileImage
                  ? 'Current profile photo preview'
                  : 'No profile photo uploaded — default icon is shown'}
            </span>
          </div>
        </div>
        {user.email && (
          <div className="profile-identity-aside">
            <span className="profile-identity-email">{user.email}</span>
            <span className="badge badge-role-member">Member</span>
          </div>
        )}
      </div>

      {state?.error && (
        <div className="form-alert form-alert-error" role="alert">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="form-alert form-alert-success" role="alert">
          Profile updated successfully!
        </div>
      )}

      <form action={formAction} className="dashboard-form member-profile-form">
        {allowProfilePhoto && (
          <div className="form-group member-profile-photo-group">
            <label className="form-label">Profile photo</label>
            <ImageUpload
              currentImage={profileImage}
              onUpload={(url) => setProfileImage(url)}
              name="profile_image"
              label="profile photo"
            />
          </div>
        )}

        <div className="dashboard-form-grid-2">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Display name *</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              defaultValue={user.name}
              required
              minLength={2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="external_link" className="form-label">Portfolio / website link</label>
            <input
              id="external_link"
              name="external_link"
              type="url"
              className="form-input"
              defaultValue={user.external_link || ''}
              placeholder="https://behance.net/username"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bio" className="form-label">Biography</label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            className="form-textarea"
            defaultValue={user.bio || ''}
            placeholder="Tell others about yourself and your artistic practice..."
          />
        </div>

        <div className="dashboard-form-actions">
          <button
            type="submit"
            className="btn-primary dashboard-submit-btn"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
