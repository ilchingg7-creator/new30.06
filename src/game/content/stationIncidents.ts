import type { StationIncidentDefinition } from '../types';

const disabledBacklog = [
  ['capsule_window_frost', 'capsule_frost_01'],
  ['kitchen_spoon_union', 'kitchen_spoon_bundle_01'],
  ['garden_plant_listens_radio', 'garden_radio_plant_01'],
  ['laundry_static_storm', 'laundry_static_socks_01'],
  ['teleport_neighbor_duplicate', 'teleport_duplicate_mug_01'],
  ['panorama_star_argument', 'panorama_star_labels_01'],
  ['meteorite_pantry_label_mystery', 'pantry_labels_01'],
  ['maintenance_drones_form_committee', 'drone_schedule_board_01'],
  ['retired_cosmonaut_mug_missing', 'cosmonaut_mug_01'],
  ['mist_cook_recipe_too_large', 'kitchen_recipe_scroll_01'],
  ['vacuum_gardener_seed_escape', 'garden_seed_trail_01'],
  ['sock_master_invents_calendar', 'laundry_sock_calendar_01'],
  ['courier_delivers_future_notice', 'teleport_future_notice_01'],
  ['vip_resident_wants_red_carpet', 'vip_towel_carpet_01'],
  ['cat_sleeps_on_button', 'cat_button_label_01'],
  ['cat_brings_space_dust', 'cat_dust_jar_01'],
  ['post_renovation_old_wallpaper', 'old_wallpaper_patch_01'],
  ['second_cycle_resident_reunion', 'resident_reunion_table_01'],
  ['offline_return_station_smells_like_soup', 'soup_smell_note_01'],
  ['condition_pristine_housewarming', 'housewarming_lamp_01'],
  ['comfort_60_station_song', 'station_song_poster_01'],
  ['teleport_garden_cross_pollination', 'teleport_pollen_pot_01'],
  ['laundry_kitchen_steam_problem', 'steam_towel_hook_01'],
  ['capsule_panorama_stargazing', 'stargazing_blanket_01'],
  ['economy_kopeks_under_sofa', 'kopeks_jar_01'],
  ['renovation_upgrade_installation_day', 'upgrade_labels_01'],
  ['five_residents_table_argument', 'table_schedule_01'],
  ['first_reputation_review', 'reputation_review_frame_01'],
  ['panorama_dome_first_date', 'panorama_reserved_sign_01'],
  ['garden_laundry_moss_socks', 'moss_sock_01']
] as const;

export const stationIncidents: StationIncidentDefinition[] = [
  {
    id: 'kitchen_borscht_fog',
    category: 'room',
    priority: 80,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomOpened', roomId: 'cosmo_kitchen' },
    choices: [
      {
        id: 'vent_fog',
        effects: { conditionRepair: { cosmo_kitchen: 8 }, visualPlaceholderIds: ['kitchen_mist_patch_01'] }
      },
      { id: 'keep_aroma', effects: { comfortDelta: 2 } }
    ]
  },
  {
    id: 'capsule_snore_echo',
    category: 'condition',
    priority: 75,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomConditionBelow', roomId: 'tenant_capsule', threshold: 60 },
    choices: [
      {
        id: 'install_padding',
        effects: {
          creditsDelta: -120,
          conditionRepair: { tenant_capsule: 10 },
          visualPlaceholderIds: ['capsule_padding_01']
        }
      },
      { id: 'quiet_hours', effects: { comfortDelta: 2 } }
    ]
  },
  {
    id: 'laundry_sock_orbit',
    category: 'room',
    priority: 72,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomOpened', roomId: 'zero_g_laundry' },
    choices: [
      { id: 'catch_socks', effects: { comfortDelta: 2, visualPlaceholderIds: ['laundry_sock_cluster_01'] } },
      { id: 'ask_sock_master', effects: { conditionRepair: { zero_g_laundry: 8 } } }
    ]
  },
  {
    id: 'garden_first_sprout_vote',
    category: 'room',
    priority: 70,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomOpened', roomId: 'oxygen_garden' },
    choices: [
      { id: 'name_sprout', effects: { comfortDelta: 2 } },
      {
        id: 'build_lamp',
        effects: { conditionRepair: { oxygen_garden: 8 }, visualPlaceholderIds: ['garden_sprout_label_01'] }
      }
    ]
  },
  {
    id: 'teleport_wrong_parcel',
    category: 'room',
    priority: 68,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomOpened', roomId: 'teleport_entry' },
    choices: [
      { id: 'return_parcel', effects: { comfortDelta: 1, visualPlaceholderIds: ['teleport_parcel_01'] } },
      { id: 'open_parcel', effects: { creditsDelta: 250 } }
    ]
  },
  {
    id: 'renovation_cold_floor',
    category: 'renovation',
    priority: 95,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'renovationCompleted', minPrestigeCount: 1 },
    choices: [
      { id: 'insulate_floor', effects: { comfortDelta: 2, visualPlaceholderIds: ['capsule_rug_01'] } },
      { id: 'save_materials', effects: { creditsDelta: 150 } }
    ]
  },
  {
    id: 'condition_warning_light',
    category: 'condition',
    priority: 85,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomConditionBelow', threshold: 40 },
    choices: [
      {
        id: 'repair_now',
        effects: {
          creditsDelta: -180,
          conditionRepair: { tenant_capsule: 8 },
          visualPlaceholderIds: ['warning_bulb_01']
        }
      },
      { id: 'label_switch', effects: { comfortDelta: 1 } }
    ]
  },
  {
    id: 'cat_found_warm_pipe',
    category: 'cat',
    priority: 60,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'sceneInteraction', interactionId: 'strange_cat' },
    choices: [
      { id: 'leave_saucer', effects: { comfortDelta: 1, visualPlaceholderIds: ['cat_saucer_01'] } },
      { id: 'mark_pipe', effects: { conditionRepair: { tenant_capsule: 4 } } }
    ]
  },
  {
    id: 'kitchen_garden_soup',
    category: 'combo',
    priority: 66,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'roomComboAvailable', roomIds: ['cosmo_kitchen', 'oxygen_garden'] },
    choices: [
      { id: 'communal_soup', effects: { comfortDelta: 3, visualPlaceholderIds: ['kitchen_soup_pot_01'] } },
      {
        id: 'sell_recipe',
        effects: {
          timedBonus: {
            id: 'incident_kitchen_garden_soup_recipe',
            incomeMultiplier: 1.2,
            durationMs: 5 * 60 * 1_000
          }
        }
      }
    ]
  },
  {
    id: 'high_income_low_comfort_meeting',
    category: 'economy',
    priority: 50,
    enabled: true,
    repeatable: false,
    trigger: { kind: 'comfortIncomeMismatch', minIncomePerSecond: 25, maxComfort: 20 },
    choices: [
      { id: 'fund_tea_break', effects: { creditsDelta: -200, comfortDelta: 3 } },
      { id: 'take_minutes', effects: {} }
    ]
  },
  ...disabledBacklog.map(([id, visualPlaceholderId], index) => ({
    id,
    category: 'room',
    priority: 10 - index,
    enabled: false,
    repeatable: false,
    trigger: { kind: 'roomOpened', roomId: 'tenant_capsule' },
    choices: [
      { id: 'cozy_solution', effects: { comfortDelta: 1, visualPlaceholderIds: [visualPlaceholderId] } },
      { id: 'practical_solution', effects: { conditionRepair: { tenant_capsule: 2 } } }
    ]
  } satisfies StationIncidentDefinition))
];

Object.assign(stationIncidents.find((incident) => incident.id === 'capsule_window_frost')!, {
  category: 'condition',
  priority: 64,
  enabled: true,
  trigger: { kind: 'roomConditionBelow', roomId: 'tenant_capsule', threshold: 50 },
  choices: [
    { id: 'wipe_window', effects: { comfortDelta: 1, visualPlaceholderIds: ['capsule_frost_01'] } },
    { id: 'seal_frame', effects: { conditionRepair: { tenant_capsule: 8 } } }
  ]
} satisfies Partial<StationIncidentDefinition>);

Object.assign(stationIncidents.find((incident) => incident.id === 'kitchen_spoon_union')!, {
  category: 'resident',
  priority: 63,
  enabled: true,
  trigger: { kind: 'residentUnlocked', residentId: 'mist_cook' },
  choices: [
    { id: 'approve_union', effects: { comfortDelta: 1, visualPlaceholderIds: ['kitchen_spoon_bundle_01'] } },
    { id: 'organize_drawer', effects: { conditionRepair: { cosmo_kitchen: 6 } } }
  ]
} satisfies Partial<StationIncidentDefinition>);

Object.assign(stationIncidents.find((incident) => incident.id === 'garden_plant_listens_radio')!, {
  category: 'room',
  priority: 62,
  enabled: true,
  trigger: { kind: 'roomOpened', roomId: 'oxygen_garden' },
  choices: [
    { id: 'keep_radio', effects: { comfortDelta: 1, visualPlaceholderIds: ['garden_radio_plant_01'] } },
    { id: 'tune_signal', effects: { conditionRepair: { oxygen_garden: 6 } } }
  ]
} satisfies Partial<StationIncidentDefinition>);

Object.assign(stationIncidents.find((incident) => incident.id === 'laundry_static_storm')!, {
  category: 'condition',
  priority: 61,
  enabled: true,
  trigger: { kind: 'roomConditionBelow', roomId: 'zero_g_laundry', threshold: 60 },
  choices: [
    { id: 'ground_socks', effects: { conditionRepair: { zero_g_laundry: 10 } } },
    { id: 'name_constellation', effects: { comfortDelta: 1, visualPlaceholderIds: ['laundry_static_socks_01'] } }
  ]
} satisfies Partial<StationIncidentDefinition>);

Object.assign(stationIncidents.find((incident) => incident.id === 'teleport_neighbor_duplicate')!, {
  category: 'room',
  priority: 60,
  enabled: true,
  trigger: { kind: 'roomOpened', roomId: 'teleport_entry' },
  choices: [
    { id: 'return_mug', effects: { conditionRepair: { teleport_entry: 6 } } },
    { id: 'display_mug', effects: { comfortDelta: 1, visualPlaceholderIds: ['teleport_duplicate_mug_01'] } }
  ]
} satisfies Partial<StationIncidentDefinition>);

export const activeStationIncidents = stationIncidents.filter((incident) => incident.enabled);
