
interface PHIDataType {
  id: string;
  name: string;
  category: 'demographic' | 'medical' | 'financial' | 'psychological' | 'educational';
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  identifiers: string[];
  regulations: string[];
}

interface PHIAccessControl {
  userId: string;
  dataType: string;
  accessLevel: 'read' | 'write' | 'delete' | 'export';
  justification: string;
  minimumNecessary: boolean;
  purposeOfUse: 'treatment' | 'payment' | 'operations' | 'disclosure';
}

class PHIClassificationService {
  private phiDataTypes: PHIDataType[] = [
    {
      id: 'mental_health_records',
      name: 'Mental Health Records',
      category: 'psychological',
      sensitivity: 'critical',
      identifiers: ['emotional_state', 'distress_level', 'psychological_assessment'],
      regulations: ['HIPAA', 'FERPA']
    },
    {
      id: 'student_health_info',
      name: 'Student Health Information',
      category: 'medical',
      sensitivity: 'high',
      identifiers: ['health_status', 'medical_condition', 'therapy_notes'],
      regulations: ['HIPAA', 'FERPA']
    },
    {
      id: 'demographic_data',
      name: 'Student Demographics',
      category: 'demographic',
      sensitivity: 'medium',
      identifiers: ['student_id', 'date_of_birth', 'address'],
      regulations: ['FERPA']
    }
  ];

  classifyData(data: any): { isPHI: boolean; dataTypes: PHIDataType[]; riskLevel: string } {
    const dataString = JSON.stringify(data).toLowerCase();
    const matchedTypes: PHIDataType[] = [];

    for (const phiType of this.phiDataTypes) {
      const hasIdentifiers = phiType.identifiers.some(identifier => 
        dataString.includes(identifier.toLowerCase())
      );
      
      if (hasIdentifiers) {
        matchedTypes.push(phiType);
      }
    }

    const isPHI = matchedTypes.length > 0;
    const riskLevel = this.calculateRiskLevel(matchedTypes);

    return { isPHI, dataTypes: matchedTypes, riskLevel };
  }

  private calculateRiskLevel(dataTypes: PHIDataType[]): string {
    if (dataTypes.some(type => type.sensitivity === 'critical')) return 'critical';
    if (dataTypes.some(type => type.sensitivity === 'high')) return 'high';
    if (dataTypes.some(type => type.sensitivity === 'medium')) return 'medium';
    return 'low';
  }

  validateMinimumNecessary(accessRequest: PHIAccessControl, dataSize: number): boolean {
    // Validate that access follows minimum necessary standard
    if (dataSize > 100 && accessRequest.accessLevel === 'export') {
      return false; // Large exports need additional justification
    }

    if (accessRequest.purposeOfUse === 'operations' && accessRequest.accessLevel === 'delete') {
      return false; // Operations typically shouldn't delete PHI
    }

    return accessRequest.minimumNecessary;
  }

  getPHIDataTypes(): PHIDataType[] {
    return [...this.phiDataTypes];
  }

  getComplianceRequirements(dataTypes: PHIDataType[]): string[] {
    const regulations = new Set<string>();
    dataTypes.forEach(type => {
      type.regulations.forEach(reg => regulations.add(reg));
    });
    return Array.from(regulations);
  }
}

export const phiClassificationService = new PHIClassificationService();
