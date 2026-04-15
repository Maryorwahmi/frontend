import { Outlet } from 'react-router-dom';
import { NavDot, TalentFlowShell, type NavSection } from '@/shared/ui/talentFlow';

const learnerNavSections: NavSection[] = [
  {
    label: 'Learning',
    items: [
      { label: 'Dashboard', to: '/learner', icon: <NavDot />, exact: true },
      { label: 'My Courses', to: '/learner/courses', icon: <NavDot /> },
      { label: 'Course Catalog', to: '/learner/catalog', icon: <NavDot /> },
      { label: 'Progress', to: '/learner/progress', icon: <NavDot /> },
    ],
  },
  {
    label: 'Coursework',
    items: [
      { label: 'Assignments', to: '/learner/assignments', icon: <NavDot /> },
      { label: 'Certificates', to: '/learner/certificates', icon: <NavDot /> },
      { label: 'Notifications', to: '/learner/notifications', icon: <NavDot /> },
    ],
  },
  {
    label: 'Collaboration',
    items: [
      { label: 'Discussions', to: '/learner/discussion', icon: <NavDot /> },
      { label: 'My Team', to: '/learner/team', icon: <NavDot /> },
      { label: 'Team Allocation', to: '/learner/team-allocation', icon: <NavDot /> },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', to: '/learner/profile', icon: <NavDot /> },
      { label: 'Settings', to: '/learner/settings', icon: <NavDot /> },
    ],
  },
];

export function LearnerLayout() {
  return (
    <TalentFlowShell navSections={learnerNavSections} searchPlaceholder="Search courses, assignments, team members...">
      <Outlet />
    </TalentFlowShell>
  );
}

export default LearnerLayout;
