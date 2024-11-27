import DepartmentHomePage from '@/components/full-page-comps/DepartmentHomePage';
import React from 'react';

export default function Marketing() {
  const optionsWithLinks = [
    { text: 'Manage Coupons', link: '/admin/manage/coupons' },
    { text: 'Download User Data for Aisensy', link: '/admin/download/download-user-data' },
  ];

  return (
    <DepartmentHomePage
      department="Marketing"
      quote="Simple, To the point, Bold"
      options={optionsWithLinks}
    />
  );
}
