import { Outlet } from 'react-router-dom';
import { NavDot, TalentFlowShell, type NavSection } from '@/shared/ui/talentFlow';

const adminNavSections: NavSection[] = [
  {
    label: 'Manage',
    items: [
      { label: 'Dashboard', to: '/admin', icon: <NavDot />, exact: true },
      { label: 'Users', to: '/admin/users', icon: <NavDot /> },
      { label: 'Courses', to: '/admin/courses', icon: <NavDot /> },
      { label: 'Team Allocation', to: '/admin/team-allocation', icon: <NavDot /> },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Notifications', to: '/admin/notifications', icon: <NavDot /> },
      { label: 'Analytics', to: '/admin/analytics', icon: <NavDot /> },
      { label: 'Announcement', to: '/admin/announcements', icon: <NavDot /> },
      { label: 'Settings', to: '/admin/settings', icon: <NavDot /> },
      { label: 'Profile', to: '/admin/profile', icon: <NavDot /> },
    ],
  },
];

export function AdminLayout() {
  return (
    <TalentFlowShell navSections={adminNavSections} searchPlaceholder="Search users, teams, courses...">
      <Outlet />
    </TalentFlowShell>
  );
}

export default AdminLayout;
