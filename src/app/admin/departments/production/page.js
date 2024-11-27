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
      quote="Design is not just how it looks, it is also how it works"
      options={optionsWithLinks}
    />
  );
}
