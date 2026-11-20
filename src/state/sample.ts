/**
 * Sample content for exploring the app. This person is fictional.
 * Drafts created from it are flagged `isSample` and labelled "Sample" everywhere.
 */
import type { Draft } from './types';
import { newDraft } from './defaults';
import { newId } from '../lib/id';

export function sampleDraft(): Draft {
  const d = newDraft('Sample — Jordan Rivera');
  return {
    ...d,
    isSample: true,
    step: 'factcheck',
    goal: 'internship',
    field: 'technology',
    fieldDetail: 'Data analytics',
    targetRole: 'Data Analyst Intern',
    deliverables: ['resume', 'linkedin'],
    order: { discountCode: '', confirmedAt: new Date().toISOString() },
    profile: {
      stage: 'student',
      fullName: 'Jordan Rivera',
      email: 'jordan.rivera@example.com',
      phone: '(555) 010-2477',
      location: 'Columbus, OH',
      linkedinUrl: 'linkedin.com/in/sample-jordan-rivera',
      website: '',
      education: [
        {
          id: newId('edu'),
          school: 'Ohio Valley University',
          credential: 'BS',
          study: 'Information Systems',
          start: 'Aug 2023',
          end: 'Expected May 2027',
          details: 'Dean’s List, Fall 2024\nMember, Women in Data club',
        },
      ],
      experience: [
        {
          id: newId('exp'),
          kind: 'job',
          title: 'Student Assistant',
          org: 'University Library',
          location: 'Columbus, OH',
          start: 'Sep 2024',
          end: '',
          current: true,
          highlights:
            'I help students find research materials at the front desk\nI keep the weekly shift spreadsheet up to date for 12 student staff\nTrained 3 new assistants on the checkout system',
        },
        {
          id: newId('exp'),
          kind: 'volunteer',
          title: 'Volunteer Tutor',
          org: 'Eastside Community Center',
          location: 'Columbus, OH',
          start: 'Jan 2024',
          end: 'May 2024',
          current: false,
          highlights: 'Tutored middle school students in math once a week',
        },
      ],
      projects: [
        {
          id: newId('proj'),
          name: 'Campus Dining Survey Analysis',
          context: 'Class project — Intro to Data Analytics',
          date: 'Spring 2025',
          description:
            'Cleaned and analyzed survey responses from 340 students using Python and pandas\nBuilt charts in Tableau and presented findings to the dining services manager',
          link: '',
        },
      ],
      coursework: 'Database Systems, Statistics for Business, Intro to Data Analytics',
      skills: 'Python, SQL, Excel, Tableau, pandas, Customer service, Presenting',
      certifications: 'Google Data Analytics Certificate (in progress)',
      achievements: '',
      aboutYou:
        'I like finding patterns in messy information and explaining them in plain language. I’m most at home when I can help a team make a decision with better data.',
    },
  };
}
