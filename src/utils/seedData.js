import { localApi } from "@/api/localApi";

const INITIAL_DATA = [
    {
        dao_name: "Building",
        current_realm: "Mortal",
        realm_phase: "Early",
        cultivation_state: "Advancing",
        total_days_practiced: 1,
        cultivation_started: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 1 day ago
    },
    {
        dao_name: "Cooking",
        current_realm: "Mortal",
        realm_phase: "Early",
        cultivation_state: "Advancing",
        total_days_practiced: 0,
        cultivation_started: new Date().toISOString().split('T')[0],
    },
    {
        dao_name: "Programming",
        current_realm: "Mortal",
        realm_phase: "Early",
        cultivation_state: "Advancing",
        total_days_practiced: 0,
        cultivation_started: new Date().toISOString().split('T')[0],
    },
    {
        dao_name: "GYM",
        current_realm: "Mortal",
        realm_phase: "Early",
        cultivation_state: "Advancing",
        total_days_practiced: 0,
        cultivation_started: new Date().toISOString().split('T')[0],
    },
];

export const seedInitialData = async () => {
    const existing = await localApi.entities.Cultivation.list();
    if (existing.length === 0) {
        console.log("Seeding initial data...");
        for (const item of INITIAL_DATA) {
            await localApi.entities.Cultivation.create(item);
        }
        console.log("Seeding complete.");
        // Force reload to show data if needed, or rely on React Query invalidation if we call this in the right place
        // For now, we just seed.
        return true;
    }
    return false;
};
