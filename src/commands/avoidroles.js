const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { admin } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avoidroles')
    .setDescription('Send DM to members without specific roles')
    .addStringOption(option =>
        option.setName('message')
          .setDescription('Enter your message')
          .setRequired(true))
    .addRoleOption(option => 
      option.setName('excluderole1')
            .setDescription('Select the first role to exclude')
            .setRequired(false))
    .addRoleOption(option => 
      option.setName('excluderole2')
            .setDescription('Select the second role to exclude')
            .setRequired(false))
    .addRoleOption(option => 
        option.setName('excluderole3')
            .setDescription('Select the third role to exclude')
            .setRequired(false)),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(admin)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }
    // Collect the roles to exclude from the command options
    const excludeRoles = [];
    for (let i = 1; i <= 3; i++) { // Adjust this loop based on how many role options you add
      const roleOption = interaction.options.getRole(`excluderole${i}`);
      if (roleOption) excludeRoles.push(roleOption.id);
    }
    
    const messageToSend = interaction.options.getString('message');
    const members = await interaction.guild.members.fetch();
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    await interaction.deferReply({ ephemeral: true });

    
    for (const member of members.values()) {
      // Skip bots and the user themselves
      if (member.user.bot || member.id === interaction.user.id) continue;

      // Check if the member has any of the exclude roles
      const hasExcludedRole = excludeRoles.some(roleId => member.roles.cache.has(roleId));
      if (hasExcludedRole) continue;

      try {
        await member.send(messageToSend);
        await interaction.editReply({ content: `Message send to ${member.user.tag}` });
        console.log(`Message sent to ${member.user.tag}`);
      } catch (error) {
        await interaction.editReply({ content: `Message Could not send to ${member.user.tag}` });
        console.error(`Could not send DM to ${member.user.tag}: ${error}`);
      }
      await delay(3000); // 3-second delay to avoid rate limits
    }
    
    await interaction.editReply({ content: `DM sending complete. Messages sent successfully` });
  }
};
