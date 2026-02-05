
import React from 'react';
import { BackArrowIcon, EdmontonLogo } from './IconComponents';

interface AboutViewProps {
  onBack: () => void;
}

const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-semibold">
          <BackArrowIcon className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <EdmontonLogo className="h-16 mx-auto text-brand-blue dark:text-brand-blue-light" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
            About the Traffic Control Signage Inventory App
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Streamlining signage management for the City of Edmonton's Traffic Control Team.
          </p>
        </div>

        <div className="prose prose-lg max-w-none prose-gray dark:prose-invert">
          <p>
            This application is designed to be a comprehensive tool for Traffic Control Field Technicians. Its primary goal is to digitize and simplify the process of deploying, tracking, and managing traffic control signage for various events and projects throughout the city.
          </p>
          
          <h3>Core Functionality</h3>
          <p>
            The app provides an efficient workflow to assist the traffic control team in several key areas:
          </p>
          <ul>
            <li>
              <strong>Inventory Management:</strong> Maintain a real-time, centralized inventory of all traffic control assets (cones, barricades, signs, etc.) across multiple storage yards. This helps in understanding stock levels at a glance.
            </li>
            <li>
              <strong>Deployment Tracking:</strong> Field technicians can quickly log new "drop-offs," detailing the specific items, quantities, and locations for each project or event. This creates a digital record, replacing manual paperwork.
            </li>
            <li>
              <strong>Automated Costing & Invoicing:</strong> The system automatically calculates the total cost of deployed items based on a master price list and the duration of the deployment, generating a clear and accurate invoice for each project.
            </li>
            <li>
              <strong>Offline Capability:</strong> Recognizing that field work often occurs in areas with poor connectivity, the app is designed to be "offline-first." All data is stored locally on the device and automatically syncs with the central system when an internet connection becomes available.
            </li>
             <li>
              <strong>AI-Powered Insights:</strong> With the "Ask Gemini" feature, team members can use natural language to ask complex questions about the inventory and deployment data, receiving instant answers without needing to manually filter or search through tables.
            </li>
          </ul>

          <h3>Benefits for the Team</h3>
          <p>
            By using this tool, the Traffic Control Team can achieve greater efficiency, reduce errors associated with manual data entry, improve resource planning by understanding asset availability, and ensure consistent and accurate billing for services rendered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
