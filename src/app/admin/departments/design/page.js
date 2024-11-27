import DepartmentHomePage from '@/components/full-page-comps/DepartmentHomePage';
import React from 'react';

export default function Design() {
  const optionsWithLinks = [
    { text: 'Add designs', link: '/admin/manage/products/add/specific-categories' },
    { text: 'Orders List', link: '/admin/manage/orders/order-list' },
  ];

  return (
    <DepartmentHomePage
      department="Design"
      quote="Design is not just how it looks, it is also how it works"
      options={optionsWithLinks}
    />
  );
}
