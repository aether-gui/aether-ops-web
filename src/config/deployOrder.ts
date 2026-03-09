export interface DeployStep {
  component: string;
  action: string;
  label: string;
  requiredRole: string;
}

export const DEPLOY_ORDER: DeployStep[] = [
  {
    component: 'k8s',
    action: 'install',
    label: 'Kubernetes Cluster',
    requiredRole: 'master',
  },
  {
    component: '5gc',
    action: 'install',
    label: 'SD-Core (5G Core)',
    requiredRole: 'master',
  },
  {
    component: 'gnbsim',
    action: 'install',
    label: 'gNB Simulator',
    requiredRole: 'gnbsim',
  },
  {
    component: 'oai',
    action: 'install',
    label: 'OpenAirInterface RAN',
    requiredRole: 'oai',
  },
  {
    component: 'srsran',
    action: 'install',
    label: 'srsRAN 5G',
    requiredRole: 'srsran',
  },
  {
    component: 'ueransim',
    action: 'install',
    label: 'UERANSIM',
    requiredRole: 'ueransim',
  },
  {
    component: 'oscric',
    action: 'install',
    label: 'OSC RIC',
    requiredRole: 'oscric',
  },
  {
    component: 'n3iwf',
    action: 'install',
    label: 'N3IWF',
    requiredRole: 'n3iwf',
  },
];

export function getDeployStepsForRoles(assignedRoles: string[]): DeployStep[] {
  const roleSet = new Set(assignedRoles);
  return DEPLOY_ORDER.filter((step) => roleSet.has(step.requiredRole));
}
