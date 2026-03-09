

# Isolate Project Artifacts via Project-Scoped Storage Keys

## Problem
All projects share the same localStorage keys (`"mcp-gateways"`, `"security-policies"`, `"business-policies"`), so artifacts created in one project appear in every project.

## Solution
Namespace all localStorage keys by `projectId` (e.g., `"mcp-gateways-smart-invoice"`, `"security-policies-travel-supply-chain"`). Pass `projectId` through the component tree.

## Changes

### 1. `src/pages/Index.tsx`
- Pass `projectId` to `loadSecurityPolicies(projectId)`, `loadBusinessPolicies(projectId)`, and `saveSecurityPolicies`/`saveBusinessPolicies` calls.
- Pass `projectId` prop to `MCPGatewayCard`, `SecurityPoliciesCard`, and `BusinessPoliciesCard`.
- Re-initialize state when `projectId` changes (add `key={projectId}` on the content area or use `useEffect`).

### 2. `src/components/SecurityPoliciesCard.tsx`
- Accept `projectId` prop.
- Change `loadPolicies()` → `loadSecurityPolicies(projectId)` using key `"security-policies-${projectId}"`.
- Change `savePolicies()` → `saveSecurityPolicies(policies, projectId)` using the same namespaced key.
- Update exported `loadSecurityPolicies` and `saveSecurityPolicies` to accept `projectId` parameter.

### 3. `src/components/BusinessPoliciesCard.tsx`
- Accept `projectId` prop.
- Change storage key from `"business-policies"` to `"business-policies-${projectId}"`.
- Update exported `loadBusinessPolicies` and `saveBusinessPolicies` to accept `projectId` parameter.

### 4. `src/components/MCPGatewayCard.tsx`
- Accept `projectId` prop.
- Change storage key from `"mcp-gateways"` to `"mcp-gateways-${projectId}"`.
- Update `persistGateways` and initial state loader to use the namespaced key.

