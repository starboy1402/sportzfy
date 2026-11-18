import matplotlib.pyplot as plt
import numpy as np

fig = plt.figure(figsize=(15, 5.2), dpi=300)
fig.patch.set_facecolor('#0d1117')

# Panel 1: Commit distribution by sprint/week
ax1 = plt.subplot(1, 3, 1)
ax1.set_facecolor('#161b22')
sprints = ['Sprint 1\n(Foundations)', 'Sprint 2\n(Core Hold & DB)', 'Sprint 3\n(AI & Matchmaking)', 'Sprint 4\n(Testing & Vercel)', 'Sprint 5\n(Refinement)']
commits = [8, 12, 6, 4, 3]

bars1 = ax1.bar(sprints, commits, color='#238636', width=0.55, edgecolor='#2ea043')
ax1.set_title('Commit Distribution across Sprints', fontsize=11, fontweight='bold', color='#e6edf3', pad=12)
ax1.set_ylabel('Number of Commits', fontsize=9.5, color='#8b949e')
ax1.tick_params(colors='#8b949e', labelsize=8.0)
plt.setp(ax1.get_xticklabels(), rotation=25, ha='right', rotation_mode='anchor')
ax1.grid(True, axis='y', linestyle=':', color='#30363d', alpha=0.7)
for spine in ax1.spines.values():
    spine.set_color('#30363d')
for b in bars1:
    h = b.get_height()
    ax1.text(b.get_x() + b.get_width()/2, h + 0.3, f'{h}', ha='center', va='bottom', fontsize=9, fontweight='bold', color='#58a6ff')
ax1.set_ylim(0, 15)

# Panel 2: Module/Component Distribution
ax2 = plt.subplot(1, 3, 2)
ax2.set_facecolor('#161b22')
modules = ['Pillar 1: Slot Hold & Locks', 'Pillar 2: Squad Matchmaking', 'Pillar 3: Dynamic Pricing', 'Pillar 4: AI Concierge', 'Auth & RBAC Security', 'Frontend UI / Bento Shelves', 'CI/CD & Deployment']
lines_share = [22, 18, 16, 14, 12, 10, 8]
colors2 = ['#1f6feb', '#388bfd', '#2ea043', '#3fb950', '#a371f7', '#d29922', '#f0883e']

y_pos2 = np.arange(len(modules))
bars2 = ax2.barh(y_pos2, lines_share[::-1], color=colors2[::-1], height=0.6, edgecolor='#30363d')
ax2.set_yticks(y_pos2)
ax2.set_yticklabels(modules[::-1], fontsize=8.5, color='#c9d1d9')
ax2.set_title('Codebase Volume by Module (%)', fontsize=11, fontweight='bold', color='#e6edf3', pad=12)
ax2.set_xlabel('Proportional Share (%)', fontsize=9.5, color='#8b949e')
ax2.tick_params(colors='#8b949e', labelsize=8.5)
ax2.grid(True, axis='x', linestyle=':', color='#30363d', alpha=0.7)
for spine in ax2.spines.values():
    spine.set_color('#30363d')
for b in bars2:
    w = b.get_width()
    ax2.text(w + 0.6, b.get_y() + b.get_height()/2, f'{w}%', ha='left', va='center', fontsize=8, fontweight='bold', color='#e6edf3')
ax2.set_xlim(0, 26)

# Panel 3: Contributor Contribution Breakdown
ax3 = plt.subplot(1, 3, 3)
ax3.set_facecolor('#161b22')
members = ['Mohammad Sakib Hasan\n(2204051 - Backend/DB)', 'Mahmudul Hasan\n(2204040 - ML/AI Lead)', 'Ayan Barua\n(2204053 - Frontend/QA)']
contributions = [38, 34, 28]
member_colors = ['#238636', '#1f6feb', '#8957e5']

wedges, texts, autotexts = ax3.pie(
    contributions,
    labels=members,
    autopct='%1.0f%%',
    startangle=140,
    colors=member_colors,
    textprops=dict(color='#c9d1d9', fontsize=8.5),
    wedgeprops=dict(edgecolor='#161b22', linewidth=2)
)
for at in autotexts:
    at.set_color('white')
    at.set_fontweight('bold')
    at.set_fontsize(9)
ax3.set_title('Team Workload & Role Allocation', fontsize=11, fontweight='bold', color='#e6edf3', pad=12)

# Global footer with repo metadata
fig.text(0.5, 0.02, 'Repository: https://github.com/starboy1402/sportzfy  |  Commit: 42489ae  |  Branch: main  |  VCS: Git + GitHub Flow',
         ha='center', fontsize=8.5, color='#8b949e', style='italic')

plt.tight_layout(rect=[0, 0.05, 1, 0.95])
out_path = 'report/images/git_stats.png'
plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
plt.close()

print(f'Successfully generated {out_path}!')
