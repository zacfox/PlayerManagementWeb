package com.mathedia.clients;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import javax.ejb.Stateless;
import javax.enterprise.event.Observes;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.mathedia.players.events.PlayerEvent;

/**
 * Die Clients werden über Änderungen informiert.
 * 
 * @author tobi
 *
 */
@ServerEndpoint("/player")
@Stateless
public class PlayersWebSocket {

	private static Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>()); //Alle Sessions werden parallel vorgehalten
	
	@OnOpen
	public void onConnection(Session session) {
		sessions.add(session);
	}
	
	@OnClose
	public void onDisconnect(Session session) {
		sessions.remove(session);
	}
	
	@OnMessage
	public void onMessage(Session session, String message) {
		notifySessions(message);
	}
	
	public void onEvent(@Observes PlayerEvent event) {
		notifySessions(event.getMessage());
	}
	
	private void notifySessions(String message) {
		for(Session session : sessions) {
			session.getAsyncRemote().sendText(message);
		}
	}

}
