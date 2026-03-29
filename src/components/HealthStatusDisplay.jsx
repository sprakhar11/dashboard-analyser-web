/**
 * Presentational component showing the current database connectivity status.
 * @param {{ databaseStatus: string }} props
 */
export default function HealthStatusDisplay({ databaseStatus }) {
  return (
    <div role="status" aria-label="Database health status">
      <p>Database status: {databaseStatus}</p>
    </div>
  );
}
