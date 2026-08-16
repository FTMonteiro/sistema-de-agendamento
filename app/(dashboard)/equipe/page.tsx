"use client";

import { useState } from "react";

import { team as initialTeam, TeamMember } from "@/data/Team";

import { TeamHeader } from "@/components/equipe/TeamHeader";
import TeamStats from "@/components/equipe/TeamStats";
import TeamList from "@/components/equipe/TeamList";

export default function EquipePage() {
  const [members, setMembers] = useState<TeamMember[]>(initialTeam);

  function handleAddMember(newMember: TeamMember) {
    setMembers((currentMembers) => [...currentMembers, newMember]);
  }

  function handleUpdateMember(updatedMember: TeamMember) {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === updatedMember.id ? updatedMember : member,
      ),
    );
  }

  function handleDeleteMember(id: TeamMember["id"]) {
    setMembers((currentMembers) =>
      currentMembers.filter((member) => member.id !== id),
    );
  }

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <TeamHeader onAddMember={handleAddMember} />

      <TeamStats members={members} />

      <TeamList
        members={members}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
      />
    </main>
  );
}
