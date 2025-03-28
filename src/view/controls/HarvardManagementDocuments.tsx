import React from 'react';
import { VuiFlexContainer, VuiFlexItem, VuiTitle, VuiText } from '../../ui';
import './harvardManagementDocuments.scss';

interface Document {
  id: string;
  title: string;
  date: string;
  type: string;
}

const DOCUMENTS: Document[] = [
  // Student Services & Support
  {
    id: "clubs-2024",
    title: "Student Life and Campus Clubs Guide",
    date: "2024-03-25",
    type: "Student Services"
  },
  {
    id: "military-2024",
    title: "Military Student Services Information",
    date: "2024-03-25",
    type: "Student Services"
  },
  {
    id: "counseling-2024",
    title: "Student Counseling Services Overview",
    date: "2024-03-25",
    type: "Student Services"
  },
  {
    id: "tutoring-2024",
    title: "English Center Tutoring Resources",
    date: "2024-03-25",
    type: "Student Services"
  },
  {
    id: "career-2024",
    title: "Career Services Center Guide",
    date: "2024-03-25",
    type: "Student Services"
  },

  // Academic Information
  {
    id: "catalog-2024",
    title: "City College Catalog 2024-25 (Second Addenda)",
    date: "2024-03-25",
    type: "Academic Information"
  },
  {
    id: "programs-2024",
    title: "Academic Programs Directory",
    date: "2024-03-25",
    type: "Academic Information"
  },
  {
    id: "transfer-2024",
    title: "Transfer Resources Guide",
    date: "2024-03-25",
    type: "Academic Information"
  },
  {
    id: "pcas-2024",
    title: "Professional College Advisory Session Guide",
    date: "2024-03-25",
    type: "Academic Information"
  },

  // Financial Aid & Costs
  {
    id: "scholarships-2024",
    title: "Scholarship Opportunities Guide",
    date: "2024-03-25",
    type: "Financial Aid"
  },
  {
    id: "aid-calendar-2024",
    title: "Financial Aid Calendar 2024-25",
    date: "2024-03-25",
    type: "Financial Aid"
  },
  {
    id: "ecmc-2024",
    title: "ECMC Financial Resources Guide",
    date: "2024-03-25",
    type: "Financial Aid"
  },
  {
    id: "loans-2024",
    title: "Student Loans Information",
    date: "2024-03-25",
    type: "Financial Aid"
  },
  {
    id: "costs-2024",
    title: "Cost of Attendance Guide",
    date: "2024-03-25",
    type: "Financial Aid"
  },
  {
    id: "aid-faq-2024",
    title: "Financial Aid FAQ",
    date: "2024-03-25",
    type: "Financial Aid"
  },

  // Admissions & Enrollment
  {
    id: "enrollment-steps-2024",
    title: "Steps to Enrollment Guide",
    date: "2024-03-25",
    type: "Enrollment"
  }
];

// Group documents by type
const groupDocumentsByType = (docs: Document[]) => {
  const groups: { [key: string]: Document[] } = {};
  docs.forEach(doc => {
    if (!groups[doc.type]) {
      groups[doc.type] = [];
    }
    groups[doc.type].push(doc);
  });
  return groups;
};

export const HarvardManagementDocuments: React.FC = () => {
  const groupedDocuments = groupDocumentsByType(DOCUMENTS);

  return (
    <div className="documentsContainer">
      <div className="documentsContent">
        <VuiFlexContainer direction="column" spacing="l">
          <VuiFlexItem>
            <VuiTitle size="l">
              <h1>References</h1>
            </VuiTitle>
          </VuiFlexItem>

          <VuiFlexItem>
            <VuiFlexContainer wrap>
              {Object.entries(groupedDocuments).map(([type, docs]) => (
                <VuiFlexItem key={type} grow={1} className="categoryWrapper">
                  <div className="categorySection">
                    <VuiTitle size="m">
                      <h2>{type}</h2>
                    </VuiTitle>
                    <div className="categoryDocuments">
                      {docs.map(doc => (
                        <div key={doc.id} className="documentItem">
                          <VuiText>
                            <p className="documentTitle">{doc.title}</p>
                            <p className="documentDate">{doc.date}</p>
                          </VuiText>
                        </div>
                      ))}
                    </div>
                  </div>
                </VuiFlexItem>
              ))}
            </VuiFlexContainer>
          </VuiFlexItem>
        </VuiFlexContainer>
      </div>
    </div>
  );
}; 