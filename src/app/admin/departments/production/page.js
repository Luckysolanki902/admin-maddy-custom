import DepartmentHomePage from '@/components/full-page-comps/DepartmentHomePage';
import React from 'react';

export default function Production() {
  const optionsWithLinks = [
    { text: 'Download Templates', link: '/admin/download/download-production-templates' },
    { text: 'Orders List', link: '/admin/manage/orders/order-list' },
  ];

  return (
    <DepartmentHomePage
      department="Production"
      quote="If you can’t describe what you are doing as a process, you don’t know what you’re doing"
      options={optionsWithLinks}
    />
  );
}
