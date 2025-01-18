import React from 'react';
import { useParams } from 'react-router-dom';
import AdviserChat from '../Adviser/AdviserChat';

const Insights = () => {
  const { clientId } = useParams<{ clientId: string }>();

  console.log(clientId, "CLINET ID FOR ALEX")

  if (!clientId) {
    return <div className="p-4 text-red-600">No client ID provided</div>;
  }

  return (
    <div>
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Client Communication & Reports</h3>
        <AdviserChat clientId={clientId} />
      </div>
    </div>
  );
};

export default Insights;
