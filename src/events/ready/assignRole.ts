import { ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import role from '../../configs/roles.json';
import Features from '../../database/models/Features';

export async function assignRoles(interaction: ButtonInteraction) {

  // early return if the feature is disabled
  const feature = await Features.findOne({ name: 'Role Assigner' });
  if (!feature?.isEnabled) {
    await interaction.editReply({
      content: `Role Assigner is disabled. Please try again later.`,
    });
    return;
  }

  const role = interaction.guild?.roles.cache.get(interaction.customId);
  const guild = interaction.guild;


  if (!guild) {
    await interaction.editReply({
      content: 'Guild not found sorry!',
    });
    return;
  }


  if (!role) {
    await interaction.editReply({
      content: 'Role not found sorry!',
    });
    return;
  }

  if (!interaction.inCachedGuild()) {
    await interaction.editReply({
      content: 'You need to be in the server to get the role!',
    });
    return;
  }

  if (!guild.members.me) {
    await interaction.editReply({
      content: 'I am not in the guild!',
    });
    return;
  }

  if (
    role.position >= guild?.members?.me.roles.highest.position ||
    !guild?.members?.me.permissions.has(PermissionFlagsBits.ManageRoles)
  ) {
    await interaction.editReply({
      content: "I don't have permissions to grant this role, either the role is higher than my highest role or create an admin role for me!",
    });
    return;
  }
  const hasRole = interaction.member.roles.cache.has(role.id);
  if (hasRole) {
    await interaction.member.roles.remove(role);
    await interaction.editReply({
      content: `The role ${role} has been removed!`,
    });
    return;
  }

  await interaction.member.roles.add(role);
  await interaction.editReply({
    content: `The role ${role} has been added!`,
  });
}
