import DepartmentHomePage from '@/components/full-page-comps/DepartmentHomePage';
import React from 'react';

export default function WEBD() {
  const optionsWithLinks = [
  ];

  return (
    <DepartmentHomePage
      department="Web-d"
      quote="If you were looking for buttons to click, you're in the wrong department."
      options={optionsWithLinks}
    />
  );
}
