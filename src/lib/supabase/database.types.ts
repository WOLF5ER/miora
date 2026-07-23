export type ServiceCategory =
  | "Маникюр"
  | "Брови и ресницы"
  | "Визаж"
  | "Стрижки и укладки"
  | "Косметология"
  | "Прочее";

export type UserRole = "client" | "master";
export type BookingStatus = "pending" | "confirmed" | "cancelled";

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type View<Row> = {
  Row: Row;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
        },
        {
          id: string;
          role?: UserRole;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
        }
      >;
      master_profiles: Table<
        {
          id: string;
          specialization: string;
          city: string;
          district: string;
          bio: string;
          price_from: number;
          is_verified: boolean;
          member_since: string;
          hue: number;
          cover_url: string | null;
        },
        {
          id: string;
          specialization?: string;
          city?: string;
          district?: string;
          bio?: string;
          price_from?: number;
          is_verified?: boolean;
          member_since?: string;
          hue?: number;
          cover_url?: string | null;
        }
      >;
      services: Table<
        {
          id: string;
          master_id: string;
          category: ServiceCategory;
          title: string;
          price: number;
          duration_min: number;
          online_booking: boolean;
          created_at: string;
        },
        {
          master_id: string;
          category: ServiceCategory;
          title: string;
          price: number;
          duration_min: number;
          online_booking?: boolean;
        }
      >;
      portfolio_items: Table<
        {
          id: string;
          master_id: string;
          category: ServiceCategory | null;
          caption: string;
          hue: number;
          image_url: string | null;
          created_at: string;
        },
        {
          master_id: string;
          category?: ServiceCategory | null;
          caption?: string;
          hue?: number;
          image_url?: string | null;
        }
      >;
      reviews: Table<
        {
          id: string;
          master_id: string;
          client_id: string | null;
          author_name: string;
          rating: number;
          text: string;
          master_reply: string | null;
          created_at: string;
        },
        {
          master_id: string;
          client_id?: string | null;
          author_name: string;
          rating: number;
          text?: string;
          master_reply?: string | null;
        }
      >;
      bookings: {
        Row: {
          id: string;
          client_id: string | null;
          master_id: string;
          service_id: string | null;
          service_title: string;
          client_name: string | null;
          client_phone: string | null;
          price: number;
          duration_min: number;
          scheduled_at: string;
          status: BookingStatus;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          client_id?: string | null;
          master_id: string;
          service_id?: string | null;
          service_title: string;
          client_name?: string | null;
          client_phone?: string | null;
          price: number;
          duration_min: number;
          scheduled_at: string;
          status?: BookingStatus;
          comment?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_master_id_fkey";
            columns: ["master_id"];
            isOneToOne: false;
            referencedRelation: "master_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      client_notes: Table<
        {
          master_id: string;
          client_id: string;
          preferences: string;
          notes: string;
          updated_at: string;
        },
        {
          master_id: string;
          client_id: string;
          preferences?: string;
          notes?: string;
          updated_at?: string;
        }
      >;
      favorites: Table<
        { client_id: string; master_id: string; created_at: string },
        { client_id: string; master_id: string }
      >;
      expenses: Table<
        { id: string; master_id: string; label: string; amount: number; occurred_on: string },
        { master_id: string; label: string; amount: number; occurred_on?: string }
      >;
    };
    Views: {
      master_public: View<{
        id: string;
        name: string;
        avatar_url: string | null;
        cover_url: string | null;
        specialization: string;
        city: string;
        district: string;
        bio: string;
        price_from: number;
        is_verified: boolean;
        member_since: string;
        hue: number;
        rating: number;
        reviews_count: number;
        bookings_count: number;
      }>;
    };
    Functions: Record<string, never>;
  };
};

export type MasterPublic = Database["public"]["Views"]["master_public"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type PortfolioItemRow = Database["public"]["Tables"]["portfolio_items"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
